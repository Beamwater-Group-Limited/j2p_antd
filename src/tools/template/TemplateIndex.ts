
const TEMPLATE_INDEX_STRING = `
{{#each components}}
export * from "./{{this}}"
{{/each}}
`;

const TEMPLATE_DYNAMICIMPORT_STRING = `
export const dynamicComponentModules = {
{{#each components}}
    {{this}}: () => import("@/pipelines/{{../username}}"),
{{/each}}
}
`;

export {
    TEMPLATE_INDEX_STRING,
    TEMPLATE_DYNAMICIMPORT_STRING,
}
