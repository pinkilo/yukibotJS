jest.mock("winston", () => ({
  esModule: true,
  createLogger: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
    alert: jest.fn(),
  })),
  transports: {
    Console: jest.fn(),
  },
  format: {
    combine: jest.fn(),
    colorize: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    errors: jest.fn(),
  },
}))

jest.useFakeTimers()
