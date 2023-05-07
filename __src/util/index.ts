import file from "./file"

export const randFromRange = (
  iMin: number,
  eMax: number,
  round: boolean = true
): number => {
  let val = iMin + Math.random() * eMax
  if (round) val = Math.floor(val)
  return val
}

export { file }
