// import { NextResponse } from 'next/server';
// import { writeFile } from 'fs/promises';
// import path from 'path';
// import { query } from '@/lib/db';
//
// export async function POST(request: Request) {
//   try {
//     // TODO: Zastąpić logiką sesji
//     const userId = "9ffe61cb-a17d-403b-bd12-758052f549b8";
//
//     const formData = await request.formData();
//     const file = formData.get('file') as File | null;
//     const applicationId = formData.get('applicationId') as string | null;
//
//     // Zgodne z ENUM `required_doc_type`
//     const docType = formData.get('docType') as string | null;
//
//     if (!file || !applicationId || !docType) {
//       return NextResponse.json({ error: "Brak pliku, ID aplikacji lub typu dokumentu" }, { status: 400 });
//     }
//
//     // Walidacja, czy aplikacja faktycznie należy do tego użytkownika
//     const verifySql = `SELECT id FROM program_applications WHERE id = $1 AND user_id = $2`;
//     const verifyResult = await query(verifySql, [applicationId, userId]);
//
//     if (verifyResult.rowCount === 0) {
//       return NextResponse.json({ error: "Brak dostępu do tej aplikacji" }, { status: 403 });
//     }
//
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//
//     // Generowanie unikalnej nazwy, żeby pliki się nie nadpisywały
//     const uniqueFileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
//     let fileUrl = '';
//
//     const uploadDir = path.join(process.cwd(), 'public/uploads');
//     const filePath = path.join(uploadDir, uniqueFileName);
//     await writeFile(filePath, buffer);
//     fileUrl = `/uploads/${uniqueFileName}`;
//
//     // Zapis w bazie danych do tabeli `application_documents`
//     // Zgodnie ze schematem: status domyślnie ustawi się na 'pending'
//     const insertDocSql = `
//       INSERT INTO application_documents (
//         application_id, doc_type, file_path, file_name, mime_type
//       ) VALUES ($1, $2, $3, $4, $5)
//       RETURNING id, status, uploaded_at;
//     `;
//
//     const insertResult = await query(insertDocSql, [
//       applicationId,
//       docType,       // Musi pasować do enum: diploma_scan, application_form, itd.
//       fileUrl,
//       file.name,
//       file.type
//     ]);
//
//     return NextResponse.json({
//       success: true,
//       document: insertResult.rows[0]
//     }, { status: 201 });
//
//   } catch (error) {
//     console.error("[POST upload] Błąd:", error);
//     return NextResponse.json({ error: "Wystąpił błąd podczas zapisu pliku" }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const token = request.headers
      .get('cookie')
      ?.split('auth_token=')[1]
      ?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Auth error' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const applicationId = formData.get('applicationId') as string | null;
    const docType = formData.get('docType') as string | null;

    if (!file || !applicationId || !docType) {
      return NextResponse.json(
        { error: 'Brak pliku, ID aplikacji lub typu dokumentu' },
        { status: 400 },
      );
    }

    const apiUrl = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

    // Utworzenie FormData do przekazania do FastAPI
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Zgodnie z backendem FastAPI doc_type prawdopodobnie jest pobierane z query lub formData.
    // Z endpointu w FastAPI: doc_type: str (jako Form lub Query).
    const response = await fetch(
      `${apiUrl}/applications/${applicationId}/documents?doc_type=${docType}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: backendFormData,
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return NextResponse.json(
        {
          error:
            data?.detail || 'Wystąpił błąd podczas zapisu pliku na backendzie',
        },
        { status: response.status },
      );
    }

    const doc = await response.json();

    return NextResponse.json(
      {
        success: true,
        document: doc,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST upload] Błąd:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas zapisu pliku' },
      { status: 500 },
    );
  }
}
