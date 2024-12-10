let products = []


function renderTableProducts () {
    let html = ''
    for (const product of products) {
        html += '<tr>'
            html += `
                <td>
                    <img src="${product.image}" class="w-100">
                    <button class="mt-1 btn btn-outline-dark btn-sm" onclick="fullDetail('image-parent','${product.id}')">
                        <i class="bi bi-info-circle-fill"></i> 
                    </button>
                </td>
            `
            html += `<td>${ product.name }</td>`
            html += `
                <td>
                    <button class="btn btn-outline-dark btn-sm" onclick="fullDetail('attributes','${product.id}')">
                        <i class="bi bi-info-circle-fill"></i>
                    </button>
                </td>
            `
            html += `<td>${ product.sku }</td>`
            html += `
                <td>
                    ${ removeTagHtml(product.description).slice(0, 200) + '... <br>' } 
                    <button class="btn btn-outline-dark btn-sm" onclick="fullDetail('description','${product.id}')">
                        <i class="bi bi-info-circle-fill"></i>
                    </button>
                </td>
            `
            html += `<td>${ product.price }</td>`
            html += `<td>${ product.quantity }</td>`
            html += `<td>${ productStatus(product.status) }</td>`
            html += `<td><div class="badge ${ product.type == 'simple' ? 'bg-primary' : 'bg-success' }" style="font-size:14px;">${ product.type }</div></td>`
            html += `
                <td>
                    <a href="create-update.html?env=${envId}&shop=${shopId}&id=${product.id}&action=edit" target="_blank" class="btn btn-secondary btn-sm"><i class="bi bi-pen"></i></a>
                    <a href="javascript: void(0);" onclick="deleteProduct('${product.id}')" class="btn btn-danger btn-sm" title="ลบ"><i class="bi bi-trash" ></i></a>
                    <a href="javascript: void(0);" onclick="recoverProduct('${product.id}')" class="btn btn-primary btn-sm" title="กู้คืน"><i class="bi bi-arrow-clockwise"></i></a>
                    <a href="javascript: void(0);" onclick="activateProduct('${product.id}')" class="btn btn-success btn-sm" title="เปิดใช้งาน"><i class="bi bi-wifi"></i></a>
                    <a href="javascript: void(0);" onclick="deActivateProduct('${product.id}')" class="btn btn-dark btn-sm" title="ปิดใช้งาน"><i class="bi bi-wifi-off"></i></a>
                </td>
            `
        html += '</tr>'
        html += '<tr>'
            html += '<td></td>'
            html += '<td colspan="10" class="p-0">'
                html += '<div><b>Detail</b></div>'
                    html += `<table class="table table-bordered table-hover mt-2 detail">`
                        html += '<thead>'
                            html += '<tr>'
                                html += '<th style="width:15%">Created</th>'
                                html += '<th>ID</th>'
                                html += '<th>Category</th>'
                                html += '<th>Brand</th>'
                                html += '<th>Weight</th>'
                                html += '<th>Width</th>'
                                html += '<th>Height</th>'
                                html += '<th>Length</th>'
                                html += '<th style="width:10%">Option logistic</th>'
                                html += '<th style="width:10%">Open COD</th>'
                            html += '<tr>'
                        html += '</thead>'
                        html += '<tbody>'
                            html += '<tr>'
                                html += `<td>${ product.created }</td>`
                                html += `<td>${ product.mkp_id }</td>`
                                html += `<td>${ product.category }</td>`
                                html += `<td>${ product.brand }</td>`
                                html += `<td>${ product.weight }</td>`
                                html += `<td>${ product.width }</td>`
                                html += `<td>${ product.height }</td>`
                                html += `<td>${ product.length }</td>`
                                html += `<td>${ product.option_logistic }</td>`
                                html += `<td>${ product.open_cod }</td>`
                            html += '</tr>'
                        html += '</tbody>'
                    html += `</table>`
                if (product.type == 'config') {
                    html += '<div><b>Product skus</b></div>'
                    html += '<table class="table table-bordered table-hover mt-2 skus">'
                        html += `
                            <thead>
                                <th style="width: 5%;">ID</th>
                                <th style="width: 5%;">Image</th>
                                <th style="width: 30%;">Seller sku</th>
                                <th>Attributes</th>
                                <th style="width: 10%;">Price</th>
                                <th style="width: 10%;">Quantity</th>
                            </thead>
                        `
                        html += '<tbody>'
                        for (const sku of product.skus) {
                            html += '<tr>'
                                html += `<td>${sku.id}</td>`
                                html += `
                                    <td>
                                        <img src="${sku.image}" class="w-100">
                                    </td>
                                `
                                html += `<td>${sku.sku || '-'}</td>`
                                html += `<td>${sku.attrs}</td>`
                                html += `<td>${sku.price}</td>`
                                html += `<td>${sku.quantity}</td>`
                            html += '</tr>'
                        }
                        html += '</tbody>'
                    html += '</table>'
                }
            html += '</td>'
        html += '</tr>'
    }   
    return html
}
function removeTagHtml(str) {
    return str.replace(/(<([^>]+)>)/ig, '')
}
function fullDetail(type, id, id2) {
    const findProduct = products.find(product => product.id == id)
    let title = ''
    let html = '<div style="text-align:left; min-height: 500px; border: 1px solid #cfcbcb; border-radius: 10px; padding: 1rem;">'
    switch (platformName) {
        case 'Tiktok Shop':
            const productTiktokShop = findProduct.tiktok_shop.info
            switch (type) {
                case 'attributes':
                    title = `Attributes product : ${findProduct.name}`
                    if (Array.isArray(productTiktokShop.product_attributes)) {
                        productTiktokShop.product_attributes.forEach(attr => {
                            html += `<div>${attr.name} : `
                            attr.values.forEach(val => {
                                html += `${val.name}`
                            })
                            html += '</div>'
                        })
                    }
                    html += ''
                    break
                case 'image-parent':
                    title = `Images product : ${findProduct.name}`
                    html += '<div class="row">'
                    if (Array.isArray(productTiktokShop.images)) {
                        productTiktokShop.images.forEach(image => {
                            html += '<div class="col-3 mt-3">'
                            image.url_list.forEach((url, index) => {
                                if (index == 0) {
                                    html += `<img src="${url}" class="w-100" style="border: 1px solid #cfcbcb; border-radius: 6px;">`
                                }
                            })
                            html += '</div>'
                        })
                    }
                    html += '<div>'
                    break;
            }
            break
        case 'Shopee':
            const productShopee = findProduct.shopee.info
            switch (type) {
                case 'attributes':
                    title = `Attributes product : ${findProduct.name}`
                    break
                case 'image-parent':
                    title = `Images product : ${findProduct.name}`
                    html += '<div class="row">'
                        if (Array.isArray(productShopee.image.image_url_list)) {
                            productShopee.image.image_url_list.forEach(image => {
                                html += '<div class="col-3 mt-3">'
                                    html += `<img src="${image}" class="w-100" style="border: 1px solid #cfcbcb; border-radius: 6px;">`
                                html += '</div>'
                            })
                        }
                    html += '<div>'
                    break
            }
            break
        case 'Lazada':
            const productLazada = findProduct.lazada.info
            switch (type) {
                case 'image-parent':
                    title = `Images product : ${findProduct.name}`
                    html += '<div class="row">'
                        if (Array.isArray(productLazada.images)) {
                            productLazada.images.forEach(image => {
                                html += '<div class="col-3 mt-3">'
                                    html += `<img src="${image}" class="w-100" style="border: 1px solid #cfcbcb; border-radius: 6px;">`
                                html += '</div>'
                            })
                        }
                    html += '<div>'
                    break
            }
            break
        case 'Line Myshop':
            const productLineMyShop = findProduct.line_myshop.info
            switch (type) {
                case 'image-parent':
                    title = `Images product : ${findProduct.imageUrls}`
                    html += '<div class="row">'
                        if (Array.isArray(productLineMyShop.imageUrls)) {
                            productLineMyShop.imageUrls.forEach(image => {
                                html += '<div class="col-3 mt-3">'
                                    html += `<img src="${image}" class="w-100" style="border: 1px solid #cfcbcb; border-radius: 6px;">`
                                html += '</div>'
                            })
                        }
                    html += '<div>'
                    break
                case 'description':
                    title = `Description product ${findProduct.name}`
                    html += findProduct.line_myshop.info.description
                    break
                case 'attributes':
                    break;
            }
            break
    }
    switch (type) {
        case 'description':
            title = `Description product ${findProduct.name}`
            html += `${findProduct.description}`
            break
    }
    html += '</div>';
    Swal.fire({
        html: html,
        title: title,
        width: '1000px'
    })
}
function productStatus(str) {
    let status = {}
    switch (platformName) {
        case 'Tiktok Shop':
            status = {
                'PENDING' : '<span class="badge rounded-pill bg-dark">รอดำเนินการ</div>',
                'FAILED' : '<span class="badge rounded-pill bg-light text-dark">ล้มเหลว</div>',
                'SELLER_DEACTIVATED' : '<div class="badge rounded-pill bg-warning text-dark">ปิดใช้งาน</div>',
                'PLATFORM_DEACTIVATED' : '<div class="badge rounded-pill bg-warning text-dark"> แพลตฟอร์มยกเลิกการใช้งาน <div>',
                'LIVE' : '<span class="badge rounded-pill bg-success">วางขายอยู่</div>',
                'DRAFT': '<span class="badge rounded-pill bg-secondary">ฉบับร่าง</div>',
                'DELETED': '<span class="badge rounded-pill bg-danger">ลบแล้ว</div>',
            }[str]
            break
        case 'Shopee':
            status = {
                'NORMAL': '<span class="badge rounded-pill bg-success">เปิดใช้งาน</div>',
                'SELLER_DELETE': '<span class="badge rounded-pill bg-danger">ลบ</div>',
                'UNLIST': '<div class="badge rounded-pill bg-warning text-dark">ปิด</div>',
                'BANNED': '<span class="badge rounded-pill bg-dark">แบน</div>',
            }[str]
            break
        case 'Lazada':
            status = {
                'Active' : '<span class="badge rounded-pill bg-success">เปิดใช้งาน</div>',
                'InActive': '<div class="badge rounded-pill bg-warning text-dark">ปิดใช้งาน</div>',
                'Pending QC': '<span class="badge rounded-pill bg-dark">รอตรวจสอบ</div>',
                'Suspended': '<span class="badge rounded-pill bg-dark">ถูกระงับ</div>',
                'Deleted': '<span class="badge rounded-pill bg-danger">ลบ</div>',
            }[str]
            break
        case 'Line Myshop':
            status = {
                'sale': '<span class="badge rounded-pill bg-success">เปิดใช้งาน</div>',
                'hold': '<div class="badge rounded-pill bg-warning text-dark">ปิดใช้งาน</div>',
            }[str]
            break
    }
    return status || ''
}
async function loadData() {
    openPopup('Loading Products')
    const getProducts = await requestData2('get', '/products', {
        per_page: 1000,
        shop: shopId,
        platform: platformId,
    })
    if (getProducts.status) {
        // console.log( getProducts.data.data.map(p => p.platform.name))
        const productsMkp = getProducts.data.data.filter(p => p.platform.name == platformName)
        products = []
        switch (platformName) {
            case 'Tiktok Shop':
                products = productsMkp.map(product => {
                    const productTiktok = product.tiktok_shop.info
                    product.mkp_id = productTiktok.product_id
                    product.created = formatDate(productTiktok.create_time * 1000)
                    product.quantity = '-'
                    product.price = '-'
                    product.attrs = ''
                    product.category = productTiktok.category_list.map(cate => {
                        return cate.local_name
                    }).join(' > ')
                    product.brand = '-'
                    product.weight = productTiktok?.package_weight || 0 + ' kg'
                    product.width = productTiktok?.package_height || 0 + ' cm'
                    product.height = productTiktok?.package_height || 0 + ' cm'
                    product.length = productTiktok?.package_length || 0 + ' cm'
                    product.option_logistic = '-'
                    product.open_cod = ''
                    product.attrs = ''
                    product.description = productTiktok.description
                    product.sku = ''
                    product.image = productTiktok?.images[0]?.url_list[0] || noImage
                    if (Array.isArray(productTiktok.product_attributes)) {
                        product.attrs = productTiktok.product_attributes.map(attr => `<div>${attr.name} : ${ attr.values.map(v => v.name).join('') }</div>`).join('')
                    }
                    if (productTiktok.skus.length == 1) {
                        product.type = 'simple'
                        const findSku = productTiktok.skus.find((_, index) => index == 0)
                        product.price = findSku.price.original_price
                        product.sku = findSku.seller_sku
                        const findStockInfos = findSku.stock_infos.find((_, index) => index == 0)
                        product.quantity = findStockInfos?.available_stock || 0
                        if (findSku.sales_attributes.length > 0) {
                            product.type = 'config'
                        }
                    } else if (productTiktok.skus.length > 1) {
                        product.type = 'config'
                    }
                    product.skus = productTiktok.skus.map((sku, index) => {
                        let imageChild = ''
                        const findStockInfos = sku.stock_infos.find((_, ii) => ii == index)
                        sku.attrs = sku.sales_attributes.map((attr) => {
                            imageChild = sku.sales_attributes[0]?.sku_img?.url_list[0] || ''
                            return `<div> ${attr.name} : ${attr.value_name}</div>`
                        }).join('')
                        sku.price = sku.price.original_price
                        sku.quantity = findStockInfos?.available_stock || 0
                        sku.sku = sku.seller_sku
                        sku.image = imageChild || noImage
                        return sku
                    })
                    return product
                }).filter(p => ['PENDING','LIVE','SELLER_DEACTIVATED','DELETED'].includes(p.status))
                break
            case 'Shopee':
                products = productsMkp.map(product => {
                    const productShopee = product.shopee.info
                    const priceInfo = productShopee?.price_info
                    product.mkp_id = productShopee.item_id
                    product.created = formatDate(moment(productShopee.create_time * 1000))
                    product.skus = []
                    product.price = Array.isArray(priceInfo) ? priceInfo[0].original_price : 0
                    product.attrs = ''
                    product.category = ''
                    product.brand = productShopee.brand.original_brand_name
                    product.weight = productShopee.weight + ' kg'
                    product.width = productShopee.dimension.package_width + ' cm'
                    product.height = productShopee.dimension.package_height + ' cm'
                    product.length = productShopee.dimension.package_length + ' cm'
                    product.option_logistic = ''
                    product.open_cod = ''
                    product.attrs = ''
                    product.description = productShopee.description
                    product.status = productShopee.item_status
                    product.quantity = productShopee?.stock_info_v2 ? productShopee.stock_info_v2.seller_stock[0]?.stock || 0 : 0
                    product.type = 'simple'
                    product.image = productShopee?.image?.image_url_list[0] || noImage
                    if (productShopee.has_model) { //config
                        const tierVariation = product.shopee.model.tier_variation
                        product.type = 'config'
                        product.skus = product.shopee.model.model.map(sku => {
                            let imageChild = ''
                            const attrs = []
                            if (sku.tier_index == undefined) {
                                tierVariation.forEach((tier, index) => {
                                    attrs.push(`${tier.name}: ${tier[index].option}`)
                                })
                            } else {
                                sku.tier_index.forEach((tier, index) => {
                                    if (tierVariation[index].option_list[tier].image) {
                                        imageChild = tierVariation[index].option_list[tier].image.image_url
                                    }
                                    attrs.push(`<div> ${tierVariation[index].name}: ${tierVariation[index].option_list[tier].option} </div>`)
                                })
                            }
                            return {
                                id: sku.model_id,
                                sku: sku.model_sku,
                                price: sku.price_info[0]?.original_price,
                                quantity: sku.stock_info_v2?.summary_info?.total_available_stock || 0,
                                attrs: attrs.join(''),
                                image: imageChild || noImage
                            }
                        })
                    }
                    return product
                })
                break
            case 'Lazada':
                products = productsMkp.map(product => {
                    const productLazada = product.lazada.info
                    product.mkp_id = productLazada.item_id
                    product.created = formatDate(moment(Number(productLazada.created_time)))
                    product.skus = []
                    product.price = 0
                    product.attrs = ''
                    product.category = ''
                    product.brand = ''
                    product.weight = ''
                    product.width = ''
                    product.height = ''
                    product.length = ''
                    product.option_logistic = ''
                    product.open_cod = ''
                    product.attrs = ''
                    product.description = ''
                    product.status = productLazada.status
                    product.quantity = 0
                    product.type = 'simple'
                    product.image = productLazada.images[0]
                    if (productLazada.skus.length == 1) {
                        const findSkuLazada = productLazada.skus.find((_, index) => index == 0)
                        product.weight = findSkuLazada.package_weight + ' kg'
                        product.width = findSkuLazada.package_width + ' cm'
                        product.height = findSkuLazada.package_height + ' cm'
                        product.length = findSkuLazada.package_width + ' cm'
                        product.price = findSkuLazada.price
                        product.quantity = findSkuLazada.quantity
                    }
                    if (productLazada.skus.length > 1) {
                        product.type = 'config'
                        product.skus = productLazada.skus.map(sku => {
                            const attrs = Object.keys(sku.saleProp).map(key => {
                                return `<div>${key} : ${sku.saleProp[key]} </div>`
                            })
                            const imageSku = sku?.Images || []
                            return {
                                id: sku.SkuId,
                                sku: `${sku.SellerSku}`,
                                price: sku.price + ' THB',
                                quantity: sku.quantity,
                                attrs: attrs.join(''),
                                image: imageSku[0] || noImage
                            }
                        })
                    }
                    return product
                }).filter(p => ['Active'].includes(p.status))
                break
            case 'Line Myshop':
                products = productsMkp.map(product => {
                    const productLineMyshop = product.line_myshop.info
                    product.mkp_id = productLineMyshop.id
                    product.created = ''
                    product.skus = []
                    product.price = 0
                    product.attrs = ''
                    product.category = ''
                    product.brand = ''
                    product.weight = ''
                    product.width = ''
                    product.height = ''
                    product.length = ''
                    product.option_logistic = ''
                    product.open_cod = ''
                    product.attrs = ''
                    product.description = ''
                    product.status = productLineMyshop.status
                    product.quantity = 0
                    product.type = 'simple'
                    product.image = productLineMyshop.imageUrls[0]
                    if (productLineMyshop.hasOnlyDefaultVariant) {
                        product.type = 'config'
                    }
                    if (productLineMyshop.hasOnlyDefaultVariant == false) {
                        product.type = 'config'
                        product.skus = productLineMyshop.variants.map(sku => {
                            return {
                                id: sku.id,
                                sku: sku.sku || '',
                                price: sku.price + ' THB',
                                quantity: sku.onHandNumber,
                                attrs: sku.options.map(attr => `<div>${attr.name} : ${attr.value}</div>`).join(''),
                                image: sku.imageUrl || noImage
                            }
                        })
                    }
                    return product
                })
                break
        }
        swal.close()
        document.querySelector('#productsList tbody').innerHTML = renderTableProducts()
    }
}

async function deleteProduct(id) {
    openPopup('Send data')
    const deleteProduct = await requestData('put', `/api/v1/products/${id}/delete`)
    if (deleteProduct.status == false || deleteProduct.data.code != 0) {
        return Swal.fire({
            html: `<div class="text-start"><pre>${JSON.stringify(deleteProduct,null,2)}</pre></div>`,
            title: 'Error',
            width: '1000px'
        })
    }
    openPopup('Success, refresh data', true).then(async (result) => {
        if (result.isConfirmed) {
            await loadData()
        }
    })
}

async function recoverProduct(id) {
    openPopup('Send data')
    const deleteProduct = await requestData('put', `/api/v1/products/${id}/recover`)
    if (deleteProduct.status == false || deleteProduct.data.code != 0) {
        return Swal.fire({
            html: `<div class="text-start"><pre>${JSON.stringify(deleteProduct, null,2)}</pre></div>`,
            title: 'Error',
            width: '1000px'
        })
    }
    openPopup('Success, refresh data', true).then(async (result) => {
        if (result.isConfirmed) {
            await loadData()
        }
    })
}

async function activateProduct(id) {
    openPopup('Send data')
    const deleteProduct = await requestData('put', `/api/v1/products/${id}/status`, {}, { status: 'activate' })
    if (deleteProduct.status == false || deleteProduct.data.code != 0) {
        return Swal.fire({
            html: `<div class="text-start"><pre>${JSON.stringify(deleteProduct, null,2)}</pre></div>`,
            title: 'Error',
            width: '1000px'
        })
    }
    openPopup('Success, refresh data', true).then(async (result) => {
        if (result.isConfirmed) {
            await loadData()
        }
    })
}

async function deActivateProduct(id) {
    openPopup('Send data')
    const deleteProduct = await requestData('put', `/api/v1/products/${id}/status`, {}, { status: 'deactivate' })
    if (deleteProduct.status == false || deleteProduct.data.code != 0) {
        return Swal.fire({
            html: `<div class="text-start"><pre>${JSON.stringify(deleteProduct, null,2)}</pre></div>`,
            title: 'Error',
            width: '1000px'
        })
    }
    openPopup('Success, refresh data', true).then(async (result) => {
        if (result.isConfirmed) {
            await loadData()
        }
    })
}


// =========== Event : select env =====================
inputEnv.addEventListener('change',async (e) => {
    const findEnv = envs.find(env => env.id == e.target.value)
    envId = findEnv.id
    omniCenterUrl = findEnv.url
    omniCenterKey = findEnv.key
    omniCenterSecret = findEnv.secret
})



// ============= Event : Select shop ===================
inputShop.addEventListener('change', async (e) => {
    shopId = e.target.value
    shopName = e.target.options[e.target.selectedIndex].text
    const selectedOption = inputShop.options[inputShop.selectedIndex]
    platformId = selectedOption.getAttribute('data-platform-id')
    platformName = selectedOption.getAttribute('data-platform')

    await loadData()
    document.querySelector('#reload_data').classList.remove('d-none')
})

// ============= Event : Onload page ====================
document.addEventListener('DOMContentLoaded',async function() {
    for (const env of envs){
        const opt = document.createElement('option');
        opt.value = env.id
        opt.innerHTML = env.name
        inputEnv.appendChild(opt)
    }
})