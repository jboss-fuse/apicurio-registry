/**
 * @license
 * Copyright 2020 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Artifact, ArtifactMetaData} from "@apicurio/registry-models";
import {LoggerService} from "../logger";


export interface CreateArtifactData {
    type: string;
    name: string|null;
    description: string|null;
    content: string;
}

export interface GetArtifactsCriteria {
    type: string;
    value: string;
    sortAscending: boolean;
}

export interface Paging {
    page: number;
    pageSize: number;
}

export interface ArtifactsSearchResults {
    artifacts: Artifact[];
    count: number;
    firstPage: boolean;
    lastPage: boolean;
    page: number;
    pageSize: number;
}

/**
 * The artifacts service.  Used to query the backend search API to fetch lists of
 * artifacts and also details about individual artifacts.
 */
export class ArtifactsService {

    private logger: LoggerService = null;

    private readonly allArtifacts: Artifact[];
    private readonly artifactContent: any;

    constructor() {
        const artifacts: Artifact[] = [
            Artifact.create("1", "OPENAPI", "My First API", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", [ "horse", "donkey" ]),
            Artifact.create("2", "ASYNCAPI", "Eventing API #1", "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", [ "light", "heat", "water", "fuel"] ),
            Artifact.create("3", "AVRO", "Invoice Type", "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.")
        ];
        for (let i=4; i < 53; i++) {
            artifacts.push(
                Artifact.create(""+i, "OPENAPI", "Example API #" + i, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.")
            );
        }
        this.allArtifacts = artifacts;
    }

    public createArtifact(data: CreateArtifactData): Promise<ArtifactMetaData> {
        if (!data.name) {
            data.name = "New Artifact";
        }
        if (!data.description) {
            data.description = "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        }
        if (!data.type) {
            data.type = "AVRO";
        }

        const artifactId: string = "" + (this.allArtifacts.length + 1);
        const newArtifact: Artifact = Artifact.create(artifactId, data.type, data.name, data.description, []);
        this.allArtifacts.push(newArtifact);
        this.artifactContent[artifactId] = data.content;

        const metaData: ArtifactMetaData = new ArtifactMetaData();
        metaData.id = artifactId;
        metaData.createdOn = new Date();
        metaData.createdBy = "user";
        metaData.name = data.name;
        metaData.description = data.description;
        metaData.globalId = 1;
        metaData.state = "ENABLED";
        metaData.type = data.type;
        metaData.version = 1;

        return new Promise<ArtifactMetaData>(resolve => {
            setTimeout(() => {
                resolve(metaData);
            }, 500);
        });
    }

    public getArtifacts(criteria: GetArtifactsCriteria, paging: Paging): Promise<ArtifactsSearchResults> {
        this.logger.debug("[ArtifactsService] Getting artifacts: ", criteria, paging);
        let artifacts: Artifact[] = [...this.allArtifacts];
        artifacts = artifacts.sort( (a1: Artifact, a2: Artifact) => {
            if (criteria.sortAscending) {
                return a1.name.localeCompare(a2.name);
            } else {
                return a2.name.localeCompare(a1.name);
            }
        });
        artifacts = artifacts.filter( artifact => {
            if (criteria.value) {
                return artifact.name.toLowerCase().indexOf(criteria.value.toLowerCase()) !== -1 ||
                    artifact.description.toLowerCase().indexOf(criteria.value.toLowerCase()) !== -1 ||
                    artifact.labels.indexOf(criteria.value) !== -1;
            } else {
                return true;
            }
        });
        const artifactCount: number = artifacts.length;
        const start: number = (paging.page - 1) * paging.pageSize;
        const end: number = start + paging.pageSize;
        artifacts = artifacts.slice(start, end);

        return new Promise<ArtifactsSearchResults>(resolve => {
            setTimeout(() => {
                const results: ArtifactsSearchResults = {
                    artifacts,
                    count: artifactCount,
                    firstPage: true,
                    lastPage: false,
                    page: paging.page,
                    pageSize: paging.pageSize
                };
                resolve(results);
            }, 200);
        });
    }

}