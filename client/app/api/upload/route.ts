import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { query } from '@/lib/db'; 

export async function POST(request: Request) {
  try {
    // TODO: Zastąpić logiką sesji
    const userId = "9ffe61cb-a17d-403b-bd12-758052f549b8";

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const applicationId = formData.get('applicationId') as string | null;
    
    // Zgodne z ENUM `required_doc_type`
    const docType = formData.get('docType') as string | null; 

    if (!file || !applicationId || !docType) {
      return NextResponse.json({ error: "Brak pliku, ID aplikacji lub typu dokumentu" }, { status: 400 });
    }

    // Walidacja, czy aplikacja faktycznie należy do tego użytkownika
    const verifySql = `SELECT id FROM program_applications WHERE id = $1 AND user_id = $2`;
    const verifyResult = await query(verifySql, [applicationId, userId]);
    
    if (verifyResult.rowCount === 0) {
      return NextResponse.json({ error: "Brak dostępu do tej aplikacji" }, { status: 403 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generowanie unikalnej nazwy, żeby pliki się nie nadpisywały
    const uniqueFileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    let fileUrl = '';

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);
    fileUrl = `/uploads/${uniqueFileName}`;

    // Zapis w bazie danych do tabeli `application_documents`
    // Zgodnie ze schematem: status domyślnie ustawi się na 'pending'
    const insertDocSql = `
      INSERT INTO application_documents (
        application_id, doc_type, file_path, file_name, mime_type
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, status, uploaded_at;
    `;
    
    const insertResult = await query(insertDocSql, [
      applicationId, 
      docType,       // Musi pasować do enum: diploma_scan, application_form, itd.
      fileUrl, 
      file.name, 
      file.type
    ]);

    return NextResponse.json({ 
      success: true, 
      document: insertResult.rows[0] 
    }, { status: 201 });

  } catch (error) {
    console.error("[POST upload] Błąd:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas zapisu pliku" }, { status: 500 });
  }
}