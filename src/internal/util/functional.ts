type Result<Success> = {
  success: boolean
  value?: Success
}

const failure = <Success>(): Result<Success> => ({ success: false })

const successOf = <Success>(value: Success): Result<Success> => ({
  success: true,
  value,
})

export { Result, successOf, failure }
