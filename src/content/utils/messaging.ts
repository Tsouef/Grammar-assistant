import type { BackgroundMessage, BackgroundResponse } from '../../shared/types'
import {
  REQUEST_TIMEOUT_MS,
  EXTENSION_ERROR_MSG,
  EXTENSION_INVALIDATED_MSG,
  isExtensionValid,
} from '../../shared/constants'

export async function sendBackgroundMessage<T extends BackgroundResponse>(
  message: BackgroundMessage
): Promise<T> {
  if (!isExtensionValid()) {
    throw new Error(EXTENSION_INVALIDATED_MSG)
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), REQUEST_TIMEOUT_MS)
  )

  let response: BackgroundResponse
  try {
    response = (await Promise.race([
      chrome.runtime.sendMessage(message),
      timeout,
    ])) as BackgroundResponse
  } catch (err) {
    if (err instanceof Error && err.message === 'Request timed out') {
      throw err
    }
    throw new Error(EXTENSION_INVALIDATED_MSG)
  }

  if (!response) {
    throw new Error(EXTENSION_ERROR_MSG)
  }
  if ('error' in response && response.error) {
    throw new Error(response.error)
  }
  return response as T
}
