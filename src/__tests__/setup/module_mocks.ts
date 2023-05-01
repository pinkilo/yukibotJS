jest.mock("winston", () => {
  return {
    __esModule: true,
    default: {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    }
  }
});

jest.mock("../../util/file")
