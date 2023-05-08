jest.mock("winston", () => ({
  esModule: true,
  createLogger: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
  })),
}))

jest.mock("nanoid", () => ({
  esModule: true,
  nanoid: jest.fn().mockImplementation(() => "nanoid_id"),
}))
