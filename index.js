const noImage = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'
let products = []

function setValueForm() {}
function renderTableProducts () {
    let html = ''
    for (const product of products) {
        html += '<tr>'
            html += `
                <td>
                    <button class="btn btn-outline-dark btn-sm" onclick="fullDetail('image-parent','${product.id}')">
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
                    <a href="create-update.html?env=${envId}&shop=${shopId}&id=${product.id}&action=edit" class="btn btn-secondary btn-sm"><i class="bi bi-pen"></i> Edit</a>
                    <a href="" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i> Delete</a>
                </td>
            `
        html += '</tr>'
        if (product.type == 'config') {
            html += '<tr>'
                html += '<td></td>'
                html += '<td colspan="10" class="p-0">'
                    html += '<div><b>Detail</b></div>'
                    html += `<table class="table table-bordered table-hover mt-2 detail">`
                        html += '<tbody>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">Created</th>'
                                html += `<td>${ product.created }</td>`
                            html += '</tr>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">ID</th>'
                                html += `<td>${ product.mkp_id }</td>`
                            html += '</tr>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">Category</th>'
                                html += `<td>${ product.category }</td>`
                            html += '</tr>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">Brand</th>'
                                html += `<td>${ product.brand }</td>`
                            html += '</tr>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">Weight</th>'
                                html += `<td>${ product.weight }</td>`
                            html += '</tr>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">Width</th>'
                                html += `<td>${ product.width }</td>`
                            html += '</tr>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">Height</th>'
                                html += `<td>${ product.height }</td>`
                            html += '</tr>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">Length</th>'
                                html += `<td>${ product.length }</td>`
                            html += '</tr>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">Option logistic</th>'
                                html += `<td>${ product.option_logistic }</td>`
                            html += '</tr>'
                            html += '<tr>'
                                html += '<th style="width: 10%;">Open COD</th>'
                                html += `<td>${ product.open_cod }</td>`
                            html += '</tr>'
                        html += '</tbody>'
                    html += `</table>`
                    html += '<div><b>Product skus</b></div>'
                    html += '<table class="table table-bordered table-hover mt-2 skus">'
                        html += `
                            <thead>
                                <th style="width: 5%;">ID</th>
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
                                html += `<td>${sku.id}</td>`
                                html += `<td><button class="btn btn-outline-dark btn-sm" onclick="fullDetail('image-childrent','${product.id}', '${sku.id}')">View </button></td>`
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
function fullDetail(type, id, id2) {
    const findProduct = products.find(product => product.id == id)
    let title = ''
    let html = '<div style="text-align:left; min-height: 500px; border: 1px solid #cfcbcb; border-radius: 10px; padding: 1rem;">'
    switch (platformName) {
        case 'Tiktok Shop':
            switch (type) {
                case 'attributes':
                    title = `Attributes product : ${findProduct.name}`
                    if (Array.isArray(findProduct.info.product_attributes)) {
                        findProduct.info.product_attributes.forEach(attr => {
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
                    if (Array.isArray(findProduct.info.images)) {
                        findProduct.info.images.forEach(image => {
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
                case 'image-childrent':
                    let findSku = findProduct.info.skus.find(sku => sku.id == id2)
                    title = `Image product : ${findProduct.name} - ${findSku.sales_attributes.map(attr => attr.value_name).join(',')}`
                    html += '<div class="row">'
                    findSku.sales_attributes.forEach((attr, index) => {
                        if (index == 0) {
                            html += '<div class="col-3 mt-3">'
                            attr.sku_img.url_list.forEach((url, index) => {
                                if (index == 0) {
                                    html += `<img src="${url}" class="w-100" style="border: 1px solid #cfcbcb; border-radius: 6px;">`
                                }
                            })
                            html += '</div>'
                        }
                    })
                    html += '<div>'
                    break;
            }
            break
        case 'Shopee':
            break
        case 'Lazada':
            break
        case 'Line Myshop':
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
async function loadData() {
    openPopup('Loading Products')
    const getProducts = await requestData('get', '/api/v1/products',{
        per_page: 100
    })
    if (getProducts.status) {
        products = []
        switch (platformName) {
            case 'Tiktok Shop':
                products = getProducts.data.data.map(product => {
                    const findImageParent = product.info.images.find((_ ,index) => index == 0)
                    product.mkp_id = product.info.product_id
                    product.created = moment(product.info.create_time * 1000).format('DD/MM/YYYY HH:mm:ss')
                    product.quantity = '-'
                    product.price = '-'
                    product.attrs = ''
                    product.category = product.info.category_list.map(cate => {
                        return cate.local_name
                    }).join(' > ')
                    product.brand = '-'
                    product.weight = product.info.package_weight + ' km'
                    product.width = product.info.package_height + ' cm'
                    product.height = product.info.package_height + ' cm'
                    product.length = product.info.package_length + ' cm'
                    product.option_logistic = '-'
                    product.open_cod = ''
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
                }).reverse() //.filter(product => product.status == 'LIVE')
                break
            case 'Shopee':
                break
            case 'Lazada':
                break
            case 'Line Myshop':
                break
        }
        swal.close()
        document.querySelector('#productsList tbody').innerHTML = renderTableProducts()
    }
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

    await loadData()
    document.querySelector('#reload_data').classList.remove('d-none')
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