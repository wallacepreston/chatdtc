export const TOOL_CALL_FUNCTION_MAP = {
    getCustomerTagsInCommerce7: 'Get Available Tags for Customers in Commerce7',
    // textCustomersInRedchirp: 'Text Customers in Redchirp',
    tagCustomersCommerce7: 'Tag Customers in Commerce7',
    createCustomerTagInCommerce7: 'Create Customer Tag in Commerce7'
} as const;

export const TOOL_CALLS_THAT_REQUIRE_CONFIRMATION = ['tagCustomersCommerce7', 'createCustomerTagInCommerce7'] as const;
