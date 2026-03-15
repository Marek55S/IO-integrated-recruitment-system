'use client';

import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useLoadDataQuery,
  useSaveDataMutation,
} from '@/src/api/generated/graphql-api';
import { Download, Save } from 'lucide-react';

type FormValues = {
  input1: string;
  input2: string;
};

export default function Home() {
  const { register, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      input1: '',
      input2: '',
    },
  });

  const [saveData, { loading: saving, error: saveError }] =
    useSaveDataMutation();
  const {
    data: loadedData,
    refetch,
    loading: loadingData,
    error: loadError,
  } = useLoadDataQuery({
    skip: true,
    notifyOnNetworkStatusChange: true,
  });

  const onSave = handleSubmit(async (values) => {
    await saveData({
      variables: {
        data: values,
      },
    });
  });

  const onLoad = async () => {
    const result = await refetch();
    const payload = result.data?.loadData;

    if (payload) {
      setValue('input1', payload.input1 ?? '');
      setValue('input2', payload.input2 ?? '');
    }
  };

  const prettyJson = JSON.stringify(loadedData?.loadData ?? {}, null, 2);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">GraphQL Typed Hooks POC</h1>

      <form
        onSubmit={onSave}
        className="space-y-4 rounded-lg border bg-card p-4">
        <div className="space-y-2">
          <Label htmlFor="input1">Input 1</Label>
          <Input
            id="input1"
            {...register('input1')}
            placeholder="Wpisz input1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="input2">Input 2</Label>
          <Input
            id="input2"
            {...register('input2')}
            placeholder="Wpisz input2"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            <Save />
            {saving ? 'Zapisywanie...' : 'Save to File'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onLoad}
            disabled={loadingData}>
            <Download />
            {loadingData ? 'Ladowanie...' : 'Load from File'}
          </Button>
        </div>
      </form>

      {saveError ? (
        <p className="text-sm text-destructive">{saveError.message}</p>
      ) : null}
      {loadError ? (
        <p className="text-sm text-destructive">{loadError.message}</p>
      ) : null}

      <div className="rounded-lg border bg-card p-4">
        <p className="mb-2 text-sm font-medium">Loaded JSON</p>
        <pre className="whitespace-pre-wrap text-sm">{prettyJson}</pre>
      </div>
    </main>
  );
}
