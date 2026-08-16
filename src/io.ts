import type { BunFile } from "bun"

export type IO = {
    readonly in: BunFile,
    readonly out: BunFile,
    readonly err: BunFile
}

export type IOProvider = () => IO

export type FileReader = (path: string) => Promise<unknown>

export const bunFileReader: FileReader = (path) => Bun.file(path).json()

export const standartIOProvider : IOProvider = () => ({
    in: Bun.stdin,
    out: Bun.stdout,
    err: Bun.stderr
})