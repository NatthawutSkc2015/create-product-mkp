const noImage = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'
const products = []

function setValueForm() {}
function renderTableProducts (products) {
    let html = ''
    for (const product of products) {
        html += '<tr>'
            html += `<td>${ product.mkp_id }</td>`
            html += `<td><img src="${ product.image || noImage }" class="w-100"></td>`
            html += `<td>${ product.name }</td>`
            html += `
                <td>
                    <button class="btn btn-dark btn-sm" onclick="fullDetail('${product.attrs}')">View Detail </button>
                </td>
            `
            html += `<td>${ product.sku }</td>`
            html += `
                <td>
                    ${ removeTagHtml(product.description).slice(0, 200) + '... <br>' } 
                    <button class="btn btn-dark btn-sm" onclick="fullDetail('${removeTagHtml(product.description)}')">View Detail </button>
                </td>
            `
            html += `<td>${ product.price }</td>`
            html += `<td>${ product.quantity }</td>`
            html += `<td>${ productStatus(product.status) }</td>`
            html += `<td><div class="badge ${ product.type == 'simple' ? 'bg-primary' : 'bg-success' }" style="font-size:14px;">${ product.type }</div></td>`
            html += `
                <td>
                    <a href="create-update.html?env=${envId}&shop=${shopId}&id=${product.id}&action=edit" class="btn btn-secondary btn-sm">Edit</a>
                    <a href="" class="btn btn-danger btn-sm">Delete</a>
                </td>
            `
        html += '</tr>'
        if (product.type == 'config') {
            html += '<tr>'
                html += '<td></td>'
                html += '<td colspan="10" class="py-0">'
                html += '<b>Children</b>'
                html += '<table class="table table-bordered table-striped mt-2">'
                    html += `
                        <thead>
                            <th style="width: 8%;">Image</th>
                            <th style="width: 30%;">Seller sku</th>
                            <th>Attributes</th>
                            <th style="width: 10%;">Price</th>
                            <th style="width: 10%;">Quantity</th>
                        </thead>
                    `
                    html += '<tbody>'
                    for (const sku of product.skus) {
                        html += '<tr>'
                            html += `<td><img src="${ sku.image || noImage }" class="w-100"></td>`
                            html += `<td>${sku.sku || '-'}</td>`
                            html += `<td>${sku.attrs}</td>`
                            html += `<td>${sku.price}</td>`
                            html += `<td>${sku.quantity}</td>`
                        html += '</tr>'
                    }
                    html += '</tbody>'
                html += '</table>'
                html += '</td>'
            html += '</tr>'
        }
    }   
    return html
}
function removeTagHtml(str) {
    return str.replace(/(<([^>]+)>)/ig, '')
}
function fullDetail(str) {
    Swal.fire({
        icon: "info",
        html: str,
    });
}
function productStatus(str) {
    let status = {}
    switch (platformName) {
        case 'Tiktok Shop':
            status = {
                'PENDING' : 'รอดำเนินการ',
                'FAILED' : 'ล้มเหลว',
                'SELLER_DEACTIVATED' : 'ผู้ขายยกเลิกการใช้งาน',
                'PLATFORM_DEACTIVATED' : 'แพลตฟอร์มยกเลิกการใช้งาน',
                'LIVE' : 'เปิดใช้งาน',
                'DRAFT': 'ฉบับร่าง',
                'DELETED': 'ผู้ขายลบ'
            }[str]
            break
    }
    return status
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
    platformName = selectedOption.getAttribute('data-platform')

    openPopup('Loading Products')

    const getProducts = await requestData('get', '/api/v1/products',{
        per_page: 100
    })
    if (getProducts.status) {
        let products = []
        switch (platformName) {
            case 'Tiktok Shop':
                products = getProducts.data.data.map(product => {
                    const findImageParent = product.info.images.find((_ ,index) => index == 0)
                    product.mkp_id = product.info.product_id
                    product.quantity = '-'
                    product.price = '-'
                    product.attrs = ''
                    if (Array.isArray(product.info.product_attributes)) {
                        product.attrs = product.info.product_attributes.map(attr => `<div>${attr.name} : ${ attr.values.map(v => v.name).join('') }</div>`).join('')
                    }
                    product.image = findImageParent?.url_list?.find((_, index) => index == 0) || ''
                    if (product.info.skus.length == 1) {
                        product.type = 'simple'
                        const findSku = product.info.skus.find((_, index) => index == 0)
                        product.price = findSku.price.original_price
                        product.sku = findSku.seller_sku
                        const findStockInfos = findSku.stock_infos.find((_, index) => index == 0)
                        product.quantity = findStockInfos?.available_stock || 0
                        if (findSku.sales_attributes.length > 0) {
                            product.type = 'config'
                        }
                    } else if (product.info.skus.length > 1) {
                        product.type = 'config'
                    }
                    product.skus = product.info.skus.map((sku, index) => {
                        const findStockInfos = sku.stock_infos.find((_, ii) => ii == index)
                        let imageChild = ''
                        sku.attrs = sku.sales_attributes.map((attr, ii) => {
                            if (ii == index) {
                                imageChild = attr?.sku_img?.url_list[0] || ''
                            }
                            return `${attr.name} : ${attr.value_name}`
                        }).join(', ')
                        sku.price = sku.price.original_price
                        sku.quantity = findStockInfos?.available_stock || 0
                        sku.sku = sku.seller_sku
                        sku.image = imageChild
                        return sku
                    })
                    return product
                }).reverse().filter(product => product.status == 'LIVE')
                break
            case 'Shopee':
                break
            case 'Lazada':
                break
            case 'Line Myshop':
                break
        }
        swal.close()
        document.querySelector('#productsList tbody').innerHTML = renderTableProducts(products)
    }
})

// ============= Event : Onload page ====================
document.addEventListener('DOMContentLoaded',async function() {
    setValueForm()
    for (const env of envs){
        const opt = document.createElement('option');
        opt.value = env.id
        opt.innerHTML = env.name
        inputEnv.appendChild(opt)
    }
})