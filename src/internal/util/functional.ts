type Result<Success> = {
  success: boolean
  value?: Success
}

const failure = <Success>(): Result<Success> => ({ success: false })

const successOf = <Success>(value: Success): Result<Success> => ({
  success: true,
  value,
})

/** Run a callback in a try-catch block. log stack trace if an err occurs. */
const attempt = async <T = unknown>(
  cb: () => Promise<T>,
  backupMsg?: string
): Promise<Result<T>> => {
  try {
    const out = await cb()
    return successOf(out)
  } catch (err) {
    console.trace((err?.message || backupMsg) ?? "")
  }
  return failure()
}

export { Result, successOf, failure, attempt }
