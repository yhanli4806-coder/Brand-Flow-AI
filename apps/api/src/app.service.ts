import { Injectable } from '@nestjs/common'
import { AGENT_VERSION } from '@brand-flow/agent'

@Injectable()
export class AppService {
  getHello(): string {
    return `Brand Flow API (agent ${AGENT_VERSION})`
  }
}
