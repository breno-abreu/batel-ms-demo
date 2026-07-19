import { unsavedChangesStore } from '@/stores/unsavedChangesStore'

/**
 * Encapsula mutações demo para o fluxo de alterações não salvas.
 * Não realiza nenhuma chamada HTTP.
 */
export async function withDemoMutation<T>(work: () => Promise<T>): Promise<T> {
  const savingOperation = unsavedChangesStore.beginSavingFromSubmission('POST')

  try {
    const result = await work()

    if (savingOperation) {
      unsavedChangesStore.finishSaving(savingOperation, true)
    }

    return result
  } catch (error) {
    if (savingOperation) {
      unsavedChangesStore.finishSaving(savingOperation, false)
    }

    throw error
  }
}
