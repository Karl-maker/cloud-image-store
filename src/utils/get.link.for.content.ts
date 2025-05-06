import { MY_DOMAIN } from "../application/configuration";
import { CONTENT_VIEW_PATH } from "../domain/constants/api.routes";
import { Content } from "../domain/entities/content";
import { ContentRepository } from "../domain/repositories/content.repository";

export const getLinkForContent = (content: Content): string => {
    return `${MY_DOMAIN}${CONTENT_VIEW_PATH}/${content.key}`
}

