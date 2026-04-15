import { License } from "./licenses";

export interface DriveMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  sizeKB?: string;
  iconLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  createdTimeFormatted?: string;
  modifiedTimeFormatted?: string;
  md5Checksum?: string;
  hasMd5Checksum?: boolean;
}



export enum ProdStatus {
  Draft = 'draft',
  Published = 'published',
  Unpublished = 'unpublished',
  TemporarilyUnavailable = 'temporarily_unavailable',
  Restricted = 'restricted',
  Archived = 'archived',
}
export interface Previews{
  gallery: string[] | null;
  video:string[] | null;
  anim: string[] | null;
}



export interface CreateProductProps {
  creatorId: string;
  title: string;
  categoryId: number | null;
  description: string | null;
  productType: ProdType
}

export interface Product {
  id: string;
  creatorId: string;
  isCreatorSuspended: boolean;
  isCreatorBanned: boolean;
  // isCreatorVerified: boolean;
  isCreatorPremium: boolean;
  isOnlyFollowers: boolean;
  categoryId: number | null;
  categoryName: string | null;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  version: number;
  status: ProdStatus;
  formats: string[] | null;
  createdAt: string;
  updatedAt: string;
  files: Prod3DDetails[] | null;
  type: ProdType;
  previews: Previews;
}

export interface ProdFile {
  id: string;
  fileType: ProdType;   
  fileSize: number;
  srcLink: string;
  tmpLink: string;
  tmpLinkExpAt: string;
  fileFormat: string;
  software?: string;
  license?: ProductLicense;
}


export interface Prod3DDetails{
  srcLink: string;
  tmpLink: string;
  tmpLinkExpAt: string;
  fileFormat: string;
  software: string;
  License: ProductLicense
}
