jest.mock("winston", () => {
  return {
    __esModule: true,
    default: {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    },
  }
})

jest.mock("../../util/file", () => {
  return {
    __esModule: true,
    default: {
      write: jest.fn().mockImplementation((_: string, data: string) => data),
      read: jest.fn(),
      list: jest.fn(),
      exists: jest.fn().mockImplementation(() => false),
    },
  }
})

jest.mock("../../event", () => ({
  __esModule: true,
  ...jest.requireActual("../../event"),
  announce: jest.fn().mockImplementation((event) => event),
}))
