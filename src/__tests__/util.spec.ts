import { randFromRange } from "../internal/util"

describe("Utilities", () => {
  describe("Random Number From Range", () => {
    let randMock
    beforeEach(() => {
      randMock = jest.spyOn(global.Math, "random").mockImplementation(() => 1.1)
    })
    it("should round to integer", () => {
      expect(Number.isInteger(randFromRange(0, 2))).toEqual(true)
    })
  })
})
