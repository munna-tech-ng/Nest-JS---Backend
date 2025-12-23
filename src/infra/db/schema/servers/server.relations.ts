import { defineRelations } from "drizzle-orm";
import * as schema from "src/infra/db/schema";

export const serverRelations = defineRelations(schema, (r) => ({
    serverSchema: {
        location: r.one.location({
            from: r.serverSchema.location_id,
            to: r.location.id,
        }),
        categories: r.many.server_category({
            from: r.serverSchema.id,
            to: r.server_category.server_id,
        }),
        tags: r.many.server_tags({
            from: r.serverSchema.id,
            to: r.server_tags.server_id,
        }),
    },
    location: {
        servers: r.many.serverSchema({
            from: r.location.id,
            to: r.serverSchema.location_id,
        }),
    },
    server_category: {
        server: r.one.serverSchema({
            from: r.server_category.server_id,
            to: r.serverSchema.id,
        }),
        category: r.one.category({
            from: r.server_category.category_id,
            to: r.category.id,
        }),
    },
    server_tags: {
        server: r.one.serverSchema({
            from: r.server_tags.server_id,
            to: r.serverSchema.id,
        }),
        tag: r.one.tag({
            from: r.server_tags.tag_id,
            to: r.tag.id,
        }),
    },
    category: {
        servers: r.many.server_category({
            from: r.category.id,
            to: r.server_category.category_id,
        }),
    },
    tag: {
        servers: r.many.server_tags({
            from: r.tag.id,
            to: r.server_tags.tag_id,
        }),
    },
}));