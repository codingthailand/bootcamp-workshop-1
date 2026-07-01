import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { pool } from "./index";

let _checkpointer: PostgresSaver | null = null;
let _setup: Promise<void> | null = null;

export async function getCheckpointer() {
    if (!_checkpointer) {
        _checkpointer = new PostgresSaver(pool);
        _setup = _checkpointer.setup();
    }
    
    if (_setup) {
        await _setup; // create checkpoint table asynchronously.
    }

    return _checkpointer;
}