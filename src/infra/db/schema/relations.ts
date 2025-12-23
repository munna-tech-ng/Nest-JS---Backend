import { serverRelations as serverRelationsPart } from './servers/server.relations';

// Combine all relations into a single object
// According to Drizzle Relations v2 migration guide:
// Relations can be defined in parts and combined when passing to drizzle
export const relations = {
    ...serverRelationsPart,
};