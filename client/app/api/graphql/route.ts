import { promises as fs } from "node:fs";
import path from "node:path";
import { buildSchema, graphql } from "graphql";
import { NextResponse } from "next/server";

const schemaPath = path.join(process.cwd(), "src", "graphql", "schema.graphql");
const dataFilePath = path.join(process.cwd(), "src", "graphql", "data.txt");

const schema = buildSchema(
  await fs.readFile(schemaPath, {
    encoding: "utf8",
  }),
);

type StoredFormData = {
  input1?: string;
  input2?: string;
};

async function readStoredData(): Promise<StoredFormData> {
  try {
    const raw = await fs.readFile(dataFilePath, { encoding: "utf8" });
    return JSON.parse(raw) as StoredFormData;
  } catch {
    return { input1: "", input2: "" };
  }
}

const rootValue = {
  loadData: async () => {
    return readStoredData();
  },
  saveData: async ({ data }: { data: StoredFormData }) => {
    await fs.writeFile(dataFilePath, JSON.stringify(data), {
      encoding: "utf8",
    });
    return true;
  },
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    query?: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  };

  if (!body.query) {
    return NextResponse.json(
      { errors: [{ message: "Missing GraphQL query" }] },
      { status: 400 },
    );
  }

  const result = await graphql({
    schema,
    source: body.query,
    rootValue,
    variableValues: body.variables,
    operationName: body.operationName,
  });

  return NextResponse.json(result, {
    status: result.errors?.length ? 400 : 200,
  });
}
