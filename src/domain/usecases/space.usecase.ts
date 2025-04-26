import { NotFoundException } from "../../application/exceptions/not.found";
import { CreateSpaceDTO } from "../interfaces/presenters/dtos/create.space.dto";
import { UpdateSpaceDTO } from "../interfaces/presenters/dtos/update.space.dto";
import { Space } from "../entities/space";
import { SpaceRepository } from "../repositories/space.repository";
import { SpaceFilterBy, SpaceSortBy } from "../types/space";
import { Usecases } from "./usecases";
import { UserRepository } from "../repositories/user.repository";
import { GenerateAccessTokenDTO } from "../interfaces/presenters/dtos/generate.space.access.token.dto";
import { JwtTokenService } from "../../application/services/token/jwt.token.service";
import { TOKEN_SECRET } from "../../application/configuration";
import { TokenServiceConfiguration } from "../types/token";
import { dateToJwtExp } from "../../utils/jwt.time.util";
import { toZonedTime } from 'date-fns-tz';
import { VerifyAccessTokenDTO } from "../interfaces/presenters/dtos/verify.space.access.token.dto";
import { UnauthorizedException } from "../../application/exceptions/unauthorized.exception";
import { TokenService } from "../../application/services/token/interface.token.service";

export class SpaceUsecase extends Usecases<Space, SpaceSortBy, SpaceFilterBy, SpaceRepository> {
    
    constructor (
        repository: SpaceRepository, 
        public userRepository: UserRepository
    ) {
        super(repository);
    }

    async mapCreateDtoToEntity(data: CreateSpaceDTO): Promise<Space> {
        const space : Space = {
            id: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            name: data.name,
            description: data.description,
            userIds: [],
            createdByUserId: data.createdByUserId,
            usedMegabytes: 0,
            shareType: data.shareType,
        }

        return space;
    }
    async mapUpdateDtoToEntity(data: UpdateSpaceDTO, item: Space): Promise<Space> {

        const space : Space = {
            ...item,
            ...data
        }

        return space;
    }

    async addMemory(spaceId: string, amount: number) : Promise<void> {
        const space = await this.repository.findById(spaceId);
        if(!space) throw new NotFoundException('space not found');

        space.usedMegabytes = space.usedMegabytes + amount;
        await this.repository.save(space);
    }

    async generateAccessToken(data: GenerateAccessTokenDTO): Promise<{
        accessToken: string;
      }> {
        const {
          timezone,
          start, 
          end 
        } = data;
      
        // Parse the start and end dates considering the timezone
        const startDateUtc = toZonedTime(`${start}T00:00:00`, timezone);
        const endDateUtc = toZonedTime(`${end}T23:59:59`, timezone);
      
        const startTimestamp = Math.floor(startDateUtc.getTime() / 1000);
        const endTimestamp = Math.floor(endDateUtc.getTime() / 1000);
        
        const config: TokenServiceConfiguration = {
          issuer: "collaboration",
          exp: (60 * 60 * 24 * 2) + dateToJwtExp(endDateUtc), // expiration time (end of day in seconds)
          //nbf: dateToJwtExp(startDateUtc), // not before time (start of day in seconds)
          audience: 'cloud-photo-share'
        };
      
        const secret = TOKEN_SECRET!;
      
        const token = await new JwtTokenService().generate(
          data,
          secret,
          config
        );
      
        return {
          accessToken: token
        };
    }

    async verifyAccessToken(data: VerifyAccessTokenDTO) : Promise<{
        timezone: string;
        instuctions?: string;
        allowPhotos: boolean;
        allowVideos: boolean;
        start: string;
        end: string;
        spaceId: string;
    }> {
        if (!data.token) {
            throw new UnauthorizedException("No token provided");
        }
        const jwtService: TokenService<GenerateAccessTokenDTO> = new JwtTokenService();
        const payload = await jwtService.validate(data.token, TOKEN_SECRET!)

        return payload
    }

}