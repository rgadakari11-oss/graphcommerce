"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyProductListItem = MyProductListItem;
var react_1 = require("react");
var next_ui_1 = require("@graphcommerce/next-ui");
var material_1 = require("@mui/material");
var router_1 = require("next/router");
var ProductListPrice_1 = require("@graphcommerce/magento-product/components/ProductListPrice/ProductListPrice");
var ProductDiscountLabel_1 = require("@graphcommerce/magento-product/components/ProductListItem/ProductDiscountLabel");
var ProductListItemImage_1 = require("@graphcommerce/magento-product/components/ProductListItem/ProductListItemImage");
var LocationOn_1 = require("@mui/icons-material/LocationOn");
var Store_1 = require("@mui/icons-material/Store");
var Call_1 = require("@mui/icons-material/Call");
var Receipt_1 = require("@mui/icons-material/Receipt");
var CheckCircle_1 = require("@mui/icons-material/CheckCircle");
var NotificationsActive_1 = require("@mui/icons-material/NotificationsActive");
var material_2 = require("@mui/material");
var ProductListItemImageContainer_1 = require("@graphcommerce/magento-product/components/ProductListItem/ProductListItemImageContainer");
var CustomProductListItemTitleAndPrice_1 = require("./CustomProductListItemTitleAndPrice");
var useProductSeller_1 = require("../../hooks/useProductSeller");
/* ---------------------------------- STYLES ---------------------------------- */
var _a = (0, next_ui_1.extendableComponent)('MyProductListItem', [
    'root',
    'imageContainer',
    'discount',
    'titleContainer',
]), classes = _a.classes, selectors = _a.selectors;
/* --------------------------- REAL PRODUCT ITEM --------------------------- */
function ProductListItemReal(props) {
    var _a;
    var name = props.name, seller_id = props.seller_id, subTitle = props.subTitle, topLeft = props.topLeft, topRight = props.topRight, bottomLeft = props.bottomLeft, bottomRight = props.bottomRight, small_image = props.small_image, price_range = props.price_range, _b = props.imageOnly, imageOnly = _b === void 0 ? false : _b, loading = props.loading, sizes = props.sizes, dontReportWronglySizedImages = props.dontReportWronglySizedImages, _c = props.aspectRatio, aspectRatio = _c === void 0 ? [4, 3] : _c, _d = props.titleComponent, titleComponent = _d === void 0 ? 'h2' : _d, _e = props.sx, sx = _e === void 0 ? [] : _e, _f = props.slotProps, slotProps = _f === void 0 ? {} : _f;
    var router = (0, router_1.useRouter)();
    var sellerId = seller_id ? Number(seller_id) : undefined;
    var seller = (0, useProductSeller_1.useProductSeller)(sellerId).seller;
    var productUrl = "/p/".concat(props.url_key);
    var sellerUrl = (seller === null || seller === void 0 ? void 0 : seller.store_code) ? "/seller/".concat(seller.store_code) : '#';
    var titleAndPriceClasses = {
        titleContainer: classes.titleContainer,
        title: classes.titleContainer, // or a separate class if you have one
        subtitle: classes.discount, // or another suitable class
    };
    return (<material_1.Box sx={__spreadArray(__spreadArray([], (Array.isArray(sx) ? sx : [sx]), true), [
            {
                display: 'flex',
                gap: 1,
                p: 1,
                backgroundColor: '#fff',
                borderRadius: 2,
                overflow: 'hidden', // ✅ prevents horizontal scroll
            },
        ], false)}>
      {/* IMAGE */}
      <material_1.Box sx={{ flex: '0 0 180px', cursor: 'pointer' }} onClick={function () { return router.push(productUrl); }}>
        <ProductListItemImageContainer_1.ProductImageContainer className={classes.imageContainer}>
          <ProductListItemImage_1.ProductListItemImage src={(small_image === null || small_image === void 0 ? void 0 : small_image.url) || '/images/placeholder-product.png'} alt={(small_image === null || small_image === void 0 ? void 0 : small_image.label) || name} aspectRatio={aspectRatio} loading={loading} sizes={sizes} dontReportWronglySizedImages={dontReportWronglySizedImages} {...slotProps.image}/>

          {!imageOnly && (<ProductListItemImageContainer_1.ProductListItemImageAreas classes={classes} topLeft={<>
                  <ProductDiscountLabel_1.ProductDiscountLabel className={classes.discount} price_range={price_range}/>
                  {topLeft}
                </>} topRight={topRight} bottomLeft={bottomLeft} bottomRight={bottomRight} {...slotProps.imageAreas}/>)}
        </ProductListItemImageContainer_1.ProductImageContainer>
      </material_1.Box>

      {/* CONTENT */}
      {!imageOnly && (<material_1.Box sx={{ flex: 1, minWidth: 0 }}>
          {/* TITLE + PRICE */}
          <CustomProductListItemTitleAndPrice_1.CustomProductListItemTitleAndPrice classes={titleAndPriceClasses} titleComponent={titleComponent} title={<material_1.Tooltip title={name} placement="top-start" arrow disableInteractive>
                <material_1.Typography component="a" href={productUrl} sx={{
                    fontSize: 13,
                    fontWeight: 450,
                    lineHeight: 1.3,
                    pt: '5px', // ✅ paddingTop added here
                    color: 'text.primary',
                    textDecoration: 'none',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                  {name}
                </material_1.Typography>
              </material_1.Tooltip>}>
            {(price_range === null || price_range === void 0 ? void 0 : price_range.minimum_price) && (<material_1.Typography sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'primary.main',
                    whiteSpace: 'nowrap',
                }}>
                ₹{' '}
                {price_range.minimum_price.regular_price.value.toLocaleString('en-IN')}
              </material_1.Typography>)}
          </CustomProductListItemTitleAndPrice_1.CustomProductListItemTitleAndPrice>


          {(seller === null || seller === void 0 ? void 0 : seller.area) && (<material_1.Typography sx={{
                    fontSize: '14px !important',
                    fontWeight: 400,
                    lineHeight: 1.3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                }}>
              <LocationOn_1.default sx={{ fontSize: 16, color: 'primary.main' }}/>
              {seller.area}
              {seller.city ? ", ".concat(seller.city) : ''}
            </material_1.Typography>)}

          {(seller === null || seller === void 0 ? void 0 : seller.store_name) && (<material_1.Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mt: '9px',
                    flexWrap: 'wrap',
                }}>
              {/* Store Icon */}
              <Store_1.default sx={{ fontSize: 16, color: 'primary.main' }}/>

              {/* Seller Name */}
              <material_1.Typography component="a" href={sellerUrl} sx={{
                    fontSize: '14px !important',
                    fontWeight: '400 !important',
                    lineHeight: '1.3 !important',
                    color: 'primary.main',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                }}>
                {seller.store_name}
              </material_1.Typography>

              {/* TAGS CONTAINER */}
              <material_1.Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    flexWrap: 'wrap',
                }}>
                {/* Trusted */}
                {(seller === null || seller === void 0 ? void 0 : seller.trust_seal) && (<material_1.Tooltip title="Verified & trusted seller" arrow>
                    <material_1.Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        px: '6px',
                        py: '2px',
                        borderRadius: '6px',
                        backgroundColor: '#F1F8F4',
                    }}>
                      <CheckCircle_1.default sx={{ fontSize: 14, color: '#1B5E20' }}/>
                      <material_1.Typography sx={{
                        fontSize: '11px !important',
                        fontWeight: 600,
                        color: '#1B5E20',
                        lineHeight: 1,
                    }}>
                        Trusted
                      </material_1.Typography>
                    </material_1.Box>
                  </material_1.Tooltip>)}

                {/* Top Seller */}
                {(seller === null || seller === void 0 ? void 0 : seller.trust_seal) && (<material_1.Tooltip title="Top rated seller" arrow>
                    <material_1.Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        px: '6px',
                        py: '2px',
                        borderRadius: '6px',
                        backgroundColor: '#FFF8E1',
                    }}>
                      <CheckCircle_1.default sx={{ fontSize: 14, color: '#F9A825' }}/>
                      <material_1.Typography sx={{
                        fontSize: '11px !important',
                        fontWeight: 600,
                        color: '#F57F17',
                        lineHeight: 1,
                    }}>
                        Top Seller
                      </material_1.Typography>
                    </material_1.Box>
                  </material_1.Tooltip>)}


              </material_1.Box>
            </material_1.Box>)}




          {/* SELLER TRUST INFO */}
          <material_1.Box sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
                mb: '9px',
                mt: '9px',
            }}>
            {/* GST */}
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CheckCircle_1.default sx={{ fontSize: 14, color: '#007a6e' }}/>
              <material_1.Typography sx={{ fontSize: '12px !important' }}>GST</material_1.Typography>
            </material_1.Box>

            {/* Email */}
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CheckCircle_1.default sx={{ fontSize: 12, color: '#007a6e' }}/>
              <material_1.Typography sx={{ fontSize: '12px !important' }}>Email</material_1.Typography>
            </material_1.Box>

            {/* Mobile */}
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CheckCircle_1.default sx={{ fontSize: 12, color: '#007a6e' }}/>
              <material_1.Typography sx={{ fontSize: '12px !important' }}>Mobile</material_1.Typography>
            </material_1.Box>

            {/* Member Since */}
            {(seller === null || seller === void 0 ? void 0 : seller.years_in_business) && (<material_2.Chip label={"".concat((_a = seller === null || seller === void 0 ? void 0 : seller.years_in_business) !== null && _a !== void 0 ? _a : 0, " Years")} size="small" sx={{
                    height: 18,
                    fontSize: '11px !important',
                    fontWeight: 600,
                    backgroundColor: 'teal', // dark green bg
                    color: '#ffffff', // correct white
                    borderRadius: '6px',
                }}/>)}

            {/* Fast Response */}
            {(seller === null || seller === void 0 ? void 0 : seller.trust_seal) && (<material_1.Tooltip title="Responds quickly" arrow>
                <material_1.Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    px: '6px',
                    py: '2px',
                    borderRadius: '6px',
                    backgroundColor: '#E3F2FD',
                }}>
                  <CheckCircle_1.default sx={{ fontSize: 14, color: '#1565C0' }}/>
                  <material_1.Typography sx={{
                    fontSize: '11px !important',
                    fontWeight: 600,
                    color: '#0D47A1',
                    lineHeight: 1,
                }}>
                    Fast Response
                  </material_1.Typography>
                </material_1.Box>
              </material_1.Tooltip>)}


          </material_1.Box>







          {/* ACTIONS */}
          <material_1.Box sx={{
                display: 'flex',
                gap: 0.75,
                mt: 1.5,
                flexWrap: 'nowrap', // prevents wrapping
            }}>
            {/* View Number */}
            <material_1.Button variant="outlined" size="small" sx={{
                minHeight: 30,
                px: 1,
                fontSize: 11,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
            }}>
              <Call_1.default sx={{ fontSize: 14, color: '#007a6e' }}/>
              View Number
            </material_1.Button>

            {/* Quote */}
            <material_1.Button variant="outlined" size="small" sx={{
                minHeight: 30,
                px: 1,
                fontSize: 11,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
            }}>
              <Receipt_1.default sx={{ fontSize: 14, color: 'black' }}/>
              Quote
            </material_1.Button>

            {/* Notify Seller */}
            <material_1.Button variant="outlined" size="small" sx={{
                minHeight: 30,
                px: 1,
                fontSize: 11,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
            }}>
              <NotificationsActive_1.default sx={{ fontSize: 14, color: 'gold' }}/>
              Notify Seller
            </material_1.Button>
          </material_1.Box>




        </material_1.Box>)}
    </material_1.Box>);
}
/* ------------------------------ SKELETON ------------------------------ */
function ProductListItemSkeleton(props) {
    var aspectRatio = props.aspectRatio, _a = props.imageOnly, imageOnly = _a === void 0 ? false : _a;
    return (<material_1.Box sx={{ display: 'flex', gap: 2 }}>
      <material_1.Box sx={{ width: 180 }}>
        <ProductListItemImageContainer_1.ProductImageContainer>
          <ProductListItemImage_1.ProductListItemImageSkeleton aspectRatio={aspectRatio}/>
        </ProductListItemImageContainer_1.ProductImageContainer>
      </material_1.Box>

      {!imageOnly && (<material_1.Box sx={{ flex: 1 }}>
          <material_1.Skeleton width="60%"/>
          <material_1.Skeleton width="40%"/>
          <material_1.Skeleton width="80%" height={36}/>
        </material_1.Box>)}
    </material_1.Box>);
}
/* ------------------------------ EXPORT ------------------------------ */
function isSkeleton(props) {
    return props.__typename === 'Skeleton';
}
function MyProductListItem(props) {
    return isSkeleton(props) ? (<ProductListItemSkeleton {...props}/>) : (<ProductListItemReal {...props}/>);
}
MyProductListItem.selectors = __assign(__assign({}, selectors), ProductListPrice_1.ProductListPrice.selectors);
