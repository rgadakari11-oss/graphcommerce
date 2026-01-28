"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProductSeller = useProductSeller;
var client_1 = require("@apollo/client");
var react_1 = require("react");
var SELLER_BY_ID_QUERY = (0, client_1.gql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  query SellerById($customer_id: Int!) {\n    vendorStores(customer_id: $customer_id) {\n      customer_id\n      store_name\n      store_code\n      years_in_business\n      area\n      city\n      phone\n      trust_seal\n    }\n  }\n"], ["\n  query SellerById($customer_id: Int!) {\n    vendorStores(customer_id: $customer_id) {\n      customer_id\n      store_name\n      store_code\n      years_in_business\n      area\n      city\n      phone\n      trust_seal\n    }\n  }\n"])));
function useProductSeller(sellerId) {
    var _a = (0, client_1.useQuery)(SELLER_BY_ID_QUERY, {
        variables: { customer_id: Number(sellerId) },
        skip: !sellerId,
    }), data = _a.data, loading = _a.loading, error = _a.error;
    var seller = (0, react_1.useMemo)(function () {
        var _a;
        if (!((_a = data === null || data === void 0 ? void 0 : data.vendorStores) === null || _a === void 0 ? void 0 : _a.length))
            return null;
        return data.vendorStores[0]; // ✅ THIS WAS MISSING
    }, [data]);
    return { seller: seller, loading: loading, error: error };
}
var templateObject_1;
