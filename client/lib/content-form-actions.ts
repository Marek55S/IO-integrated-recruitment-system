/**
 * Mapowanie identyfikatorów z YAML (`primary_action`, `submit_action`, …)
 * na logikę po stronie klienta. W YAML podajesz tylko string, np. `recruitment.forward`.
 */

export type RecruitmentFormActionContext = {
  goNext: () => Promise<void>;
  goBack: () => void;
  submitFinal: () => Promise<void>;
};

export type ProgramFormActionContext = {
  /** Pełna walidacja RHF/Zod i callback z `handleSubmit`. */
  submitValidated: () => Promise<void>;
};

export const RECRUITMENT_DEFAULT_FORWARD = 'recruitment.forward';
export const RECRUITMENT_DEFAULT_BACK = 'recruitment.back';
export const RECRUITMENT_DEFAULT_SUBMIT = 'recruitment.submit';
export const PROGRAM_DEFAULT_SUBMIT = 'program.defaultSubmit';

type RecruitmentHandler = (
  ctx: RecruitmentFormActionContext,
) => void | Promise<void>;

const recruitmentHandlers: Record<string, RecruitmentHandler> = {
  [RECRUITMENT_DEFAULT_FORWARD]: async (ctx) => {
    await ctx.goNext();
  },
  [RECRUITMENT_DEFAULT_BACK]: (ctx) => {
    ctx.goBack();
  },
  [RECRUITMENT_DEFAULT_SUBMIT]: async (ctx) => {
    await ctx.submitFinal();
  },
};

export async function runRecruitmentFormAction(
  actionId: string,
  ctx: RecruitmentFormActionContext,
): Promise<void> {
  const handler = recruitmentHandlers[actionId];
  if (!handler) {
    console.warn(
      `[content-form-actions] Nieznana akcja rekrutacji: "${actionId}"`,
    );
    return;
  }

  await handler(ctx);
}

type ProgramHandler = (ctx: ProgramFormActionContext) => void | Promise<void>;

const programHandlers: Record<string, ProgramHandler> = {
  [PROGRAM_DEFAULT_SUBMIT]: async (ctx) => {
    await ctx.submitValidated();
  },
};

export async function runProgramFormAction(
  actionId: string,
  ctx: ProgramFormActionContext,
): Promise<void> {
  const handler = programHandlers[actionId];
  if (!handler) {
    console.warn(
      `[content-form-actions] Nieznana akcja programu: "${actionId}"`,
    );
    return;
  }

  await handler(ctx);
}
