import { Controller } from '@nestjs/common';
import { CredentialsService } from './credentials.service';

@Controller()
export class CredentialsController {
    constructor(private readonly credentialsService: CredentialsService) { }
    // No gRPC endpoints defined for Credentials yet, as they are mostly internal or managed via User creation.
    // We can add ChangePassword RPC here later.
}
