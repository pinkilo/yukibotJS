jest.mock("nanoid", () => ({
  esModule: true,
  nanoid: jest.fn().mockImplementation(() => "nanoid_id"),
}))
