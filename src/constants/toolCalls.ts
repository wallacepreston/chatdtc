export const TOOL_CALL_FUNCTION_MAP = {
    getCustomerTagsInCommerce7: 'Get Available Tags for Customers in Commerce7',
    // textCustomersInRedchirp: 'Text Customers in Redchirp',
    tagCustomersCommerce7Internal: 'Tag Customers in Commerce7',
    createCustomerTagInCommerce7: 'Create Customer Tag in Commerce7',
    getOrderTagsInCommerce7: 'Get Available Tags for Orders in Commerce7',
    tagOrdersCommerce7Internal: 'Tag Orders in Commerce7',
    createOrderTagInCommerce7: 'Create Order Tag in Commerce7'
} as const;

export const TOOL_CALLS_THAT_REQUIRE_CONFIRMATION = [
    'tagCustomersCommerce7Internal',
    'createCustomerTagInCommerce7',
    'tagOrdersCommerce7Internal',
    'createOrderTagInCommerce7'
] as const;
