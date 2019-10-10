import transformGenres, { DEFAULT_GENRE_STRING } from "../transformGenres"

describe("transformGenres()", () => {
  describe("returns default genres when provided with", () => {
    const defaultGenres = [DEFAULT_GENRE_STRING]
    test("empty string", () => expect(transformGenres("")).toEqual(defaultGenres))
    test("undefined", () => expect(transformGenres()).toEqual(defaultGenres))
    test("null", () => expect(transformGenres(null)).toEqual(defaultGenres))
  })
  describe("properly splits with", () => {
    test("single genre", () => {
      expect(transformGenres("one")).toEqual(["one"])
    })
    test("two genres", () => {
      expect(transformGenres("one|two")).toEqual(["one", "two"])
    })
    test("three genres", () => {
      expect(transformGenres("one|two|three")).toEqual(["one", "two", "three"])
    })
    test("leading delimiter", () => {
      expect(transformGenres("|one|two|three")).toEqual(["one", "two", "three"])
    })
    test("trailing delimiter", () => {
      expect(transformGenres("one|two|three|")).toEqual(["one", "two", "three"])
    })
    test("double delimiter", () => {
      expect(transformGenres("one||two||three")).toEqual(["one", "two", "three"])
    })
    test("custom delimiter", () => {
      expect(transformGenres("one,two,three", ",")).toEqual(["one", "two", "three"])
    })
  })
})
