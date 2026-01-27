import { z } from "zod"
import { NewWalletInputSchema } from "./NewWalletInput.Schema"

export type NewWalletInput = z.infer<typeof NewWalletInputSchema>
