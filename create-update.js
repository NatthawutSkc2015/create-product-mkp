const statusesProduct = {
    shopee: [
        {
            text: 'Normal',
            value: 'NORMAL'
        },
        {
            text: 'Deleted',
            value: 'DELETED'
        },
        {
            text: 'Unlist',
            value: 'UNLIST'
        },
        {
            text: 'Unlist',
            value: 'Brand'
        },
    ],
    line_myshop: [
        {
            text: 'onsale',
            value: 'onsale',
        },
        {
            text: 'hide',
            value: 'hide',
        }
    ]
}
let logisticsList = []
let logisticsSelect = []
const brand = document.querySelector('[name="brand"]')
const hasChildren = document.querySelector('[id="has_children"]')
const formSkusBody = document.querySelector('#form_skus_body')
const formCreate = document.querySelector('#FormCreate')
const formLogistics = document.querySelector('#form_logistics')
const categoryCascaderMenu = $('#category-cascader-menu')
const categoryInput = document.querySelector('[name="category"]')
const inputLogistic = document.querySelector('[id="logistics"]')
const formCateCascader = document.querySelector('#form_cate_cascader')
const areaProductAttributes = document.querySelector('#area_product_attributes')
const formHeight = document.querySelector('#form_height')
const formLength = document.querySelector('#form_length')
const formWidth = document.querySelector('#form_width')
const formWeight = document.querySelector('#form_weight')
const formPrice = document.querySelector('#form_price')

function removeItem(el, action) {
    el.closest('.row').remove()
}
function addAttr(el) {
    const countAttr = el.closest('.attrs').querySelectorAll('.row').length
    if (countAttr >= 3) {
        return openPopup('Max 3 Variant', true)
    }
    const rootParent = document.querySelector('#form_skus_body')
    const parent = el.closest('.child')
    const paramsAll = Array.from(rootParent.querySelectorAll('.child'));
    const indexParent = paramsAll.indexOf(parent);
    el.closest('.attrs').insertAdjacentHTML('beforeend', templateFormAttributeSKu(indexParent, countAttr))
}
function setValueForm() {
    inputProductName.value = 'Product name ' + shopName
    inputProductSku.value = 'ProductSku'
    inputDescription.value = 'description ' + shopName
    inputWeight.value = Math.floor(Math.random() * 6) + 1
    inputHeight.value = Math.floor(Math.random() * 6) + 1
    inputWeight.value = Math.floor(Math.random() * 6) + 1
    inputLength.value = Math.floor(Math.random() * 6) + 1
    
}
function uploadPicture (el) {
    const [file] = el.files
    if (file) {
        el.closest('div').querySelector('.preview-img').src = URL.createObjectURL(file)
    }
}
function productSizeByCarier(el) {
    const optionSelects = []
    const optionsAll = el.options
    for (let i = 0; i < optionsAll.length; i++) {
        opt = optionsAll[i];
        if (opt.selected) {
            optionSelects.push(Number(opt.value))
        }
    }
    let htmlSelect = ''
    const logisticsFilter = logisticsList.filter(l => optionSelects.includes(l.id))
    logisticsSelect = []
    for (const [index, logistic] of logisticsFilter.entries()) {
        htmlSelect += `<div class="mt-2"><label class="">Carier : ${logistic.name}</label>`
        htmlSelect += `<select class="form-control logistic-product-size" data-carier-id="${logistic.id}"`
        for (const size of logistic.size_list) {
            htmlSelect += `<option value="${size.id}">${size.name}</option>`
        }
        htmlSelect += '</select></div>'
        logisticsSelect.push(logistic)
    }
    document.querySelector('#area_product_size').innerHTML = htmlSelect
}



// ============= Event : Select shop ===================
inputShop.addEventListener('change',async (e) => {
    const selectedOption = inputShop.options[inputShop.selectedIndex]
    platformName = selectedOption.getAttribute('data-platform')

    shopId = e.target.value
    shopName = e.target.options[e.target.selectedIndex].text
    openPopup('Loading Category...')
    areaProductAttributes.innerHTML = ''
    
    await getCategories()
    
    // 
    const formStatus = document.querySelector('#form_status')
    const formFormOpenCod = document.querySelector('#form_open_cod')
    const inputStatus = document.querySelector('[name="status"]')
    inputStatus.innerHTML = '<option value="">------ None ------</option>'
    formStatus.classList.add('d-none')
    formFormOpenCod.classList.add('d-none')
    formLogistics.classList.add('d-none')

    formHeight.classList.remove('d-none')
    formLength.classList.remove('d-none')
    formWidth.classList.remove('d-none')
    formWeight.classList.remove('d-none')
    formPrice.classList.remove('d-none')
    
    switch (platformName) {
        case 'Shopee': //shopee
            formStatus.classList.remove('d-none')
            formFormOpenCod.classList.remove('d-none')
            for (const obj of statusesProduct.shopee) {
                const opt = document.createElement('option');
                opt.value = obj.value
                opt.innerHTML = obj.text
                inputStatus.appendChild(opt)
            }

            
            const getLogistics = await requestData('get', '/api/v1/products/logistics')
            inputLogistic.innerHTML = ''
            if (getLogistics.status == true) {
                for (const obj of getLogistics.data.data) {
                    const opt = document.createElement('option');
                    opt.value = obj.id
                    opt.innerHTML = obj.name
                    inputLogistic.appendChild(opt)
                }
                logisticsList = getLogistics.data.data
            }
            formLogistics.classList.remove('d-none')
            break
        case 'Tiktok Shop': //tiktok
            break
        case 'Line Myshop': //line 
            formStatus.classList.remove('d-none')
            for (const obj of statusesProduct.line_myshop) {
                const opt = document.createElement('option');
                opt.value = obj.value
                opt.innerHTML = obj.text
                inputStatus.appendChild(opt)
            }
            break
        case 'Lazada': //lazada
            formHeight.classList.add('d-none')
            formLength.classList.add('d-none')
            formWidth.classList.add('d-none')
            formWeight.classList.add('d-none')
            formPrice.classList.add('d-none')
            break;
    }
    setValueForm()
})



// ============= Event : Select Brand ====================

// ============= Event : Set product variant ====================
hasChildren.addEventListener('change', (e) => {
    if(e.target.checked === true) {
        document.querySelector('#form_skus').classList.remove('d-none')
    }
    if(e.target.checked === false) {
        document.querySelector('#form_skus').classList.add('d-none')
    }
})

// ============= Event : Add sku ====================
document.querySelector('#add_sku').addEventListener('click', (el) => {
    const amountItem = document.querySelectorAll('#form_skus_body .child').length
    formSkusBody.insertAdjacentHTML('beforeend', templateFormSku(amountItem))
})

// ============= Event : Submit form ====================
formCreate.addEventListener('submit', async (el) => {
    console.log(action)
    // Stop event sent data to server
    el.preventDefault()

    // Reset dat
    logisticsSelect = []

    //  Read file name - value all in form & Prepare data format create product
    const setValue = (obj, path, value) => {
        const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.')
        keys.reduce((o, key, i) => {
            if (i === keys.length - 1) o[key] = value
            else o[key] = o[key] || (isNaN(keys[i + 1]) ? {} : {});
            return o[key];
        }, obj)
    }
    const paramsCreate = {}
    const formData = new FormData(formCreate)
    for (const [key, value] of formData.entries()) {
        const input = formCreate.querySelector(`[name="${key}"]`)
        if (input && input.type === "checkbox") {
            const checkedCheckboxes = Array.from(
                formCreate.querySelectorAll(`[name="${key}"]:checked`)
            ).map(checkbox => checkbox.id);
            setValue(paramsCreate, key, checkedCheckboxes);
        } else if (input && input.type === "radio") {
            const checkedRadio = formCreate.querySelector(`[name="${key}"]:checked`);
            setValue(paramsCreate, key, checkedRadio ? checkedRadio.id : null)
        } else if (input.tagName == "SELECT") {
            let selectedOptions
            if (platformName == 'Tiktok Shop' && key.match(/attributes.*/)) {
                if (input.type == 'select-multiple') {
                    selectedOptions = Array.from(input.selectedOptions).map((option) => {
                        return {
                            id: option.value,
                            name: option.innerText
                        }
                    })
                    setValue(paramsCreate, key, selectedOptions)
                } else if (input.type == 'select-one') {
                    if (value) {
                        setValue(paramsCreate, key, value)
                    }
                }
            } else {
                selectedOptions = value
            }
            setValue(paramsCreate, key, selectedOptions)
        } else {
            setValue(paramsCreate, key, value)
        }
    }
    // Validate 
    if (shopId == '') {
        return openPopup('please select shop !', true)
    }
    
    if (paramsCreate.category == '') {
        return openPopup('please select category !', true)
    }
    if (document.querySelector('[name="image"]').files.length == 0) {
        return openPopup('please select image !', true)
    }
    if (document.querySelector('[name="image"]').files[0]) {
        paramsCreate.image = await encodeImageFileAsURL(document.querySelector('[name="image"]').files[0])
    }

    // Set default form
    paramsCreate.is_cod = document.querySelector('[name="is_cod"]').checked
    paramsCreate.type = 'simple'
    
    if (hasChildren.checked) {
        paramsCreate.skus = await Promise.all(
        paramsCreate.skus
            .filter(sku => typeof sku != null)
            .map(async (sku) => {
                // Assuming sku.image is a File object
                if (sku.image.size == 0) {
                    sku.image = ''
                } else {
                    sku.image = await encodeImageFileAsURL(sku.image)
                }
                sku.sales_attributes = sku.sales_attributes.filter(attr => typeof attr != null)
                return sku
            })
        )
        paramsCreate.type = 'config'
    } else {
        paramsCreate.skus = []
    }


    switch (platformName) {
        case 'Shopee': //shopee
            if (logisticsSelect.length == 0) {
                openPopup('please select logistic !', true)
                return
            }
            const logistics = []
            const selectProductSizeByCarier = document.querySelectorAll('.logistic-product-size')
            for (const selectProductSize of selectProductSizeByCarier) {
                const dataCarierId = selectProductSize.getAttribute('data-carier-id')
                const logistic = logisticsSelect.find(logistic => logistic.id == dataCarierId)
                if (logistic) {
                    logistics.push({
                        // shipping_fee: '',
                        // is_free: '',
                        size_id: selectProductSize.value,
                        enabled: true,
                        logistic_id: logistic.id,
                    })
                }
            }
            paramsCreate.logistics = logistics
            break
        case 'Tiktok Shop':
            // paramsCreate.attributes = Object.keys(paramsCreate.attributes).map(attr => {
            //     return {
            //         id: attr,
            //         value: paramsCreate.attributes[attr]
            //     }
            // })
            paramsCreate.attributes = []
            break

    }

    let methodSent = {
        endpoint: '',
        method: ''
    }
    if (action == 'create') {
        methodSent.method = 'post'
        methodSent.endpoint = `/api/v1/products/create`
    } else if (action == 'edit') {
        methodSent.method = 'patch'
        methodSent.endpoint = `/api/v1/products/edit/${productId}`
    }
    
    //Sent to create product
    openPopup('Send data to create product...')
    const responseCreateUpdateProduct = await requestData(methodSent.method, methodSent.endpoint, {}, paramsCreate)
    await new Promise((res,rej) => { setTimeout(() => { res('ok') }, 1000) })
    await swal.close()

    // Handle element
    document.querySelector('#respnseCreateProduct').innerHTML = `<pre>${JSON.stringify(responseCreateUpdateProduct, null, 2)}</pre>`
    document.querySelector('#bodyCreateProduct').innerHTML = `<pre>${JSON.stringify(paramsCreate, null, 2)}</pre>`
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

    // User by page edit product
    const urlParams = new URLSearchParams(window.location.search)
    const queryEnvId = urlParams.get('env')
    const queryShopId = urlParams.get('shop')
    const queryProductId = urlParams.get('id')
    const queryAction = urlParams.get('action')
    if (queryAction == 'edit') {
        action = 'edit'
        if (queryEnvId) {
            const findEnv = envs.find(env => env.id == queryEnvId)
            omniCenterUrl = findEnv.url
            omniCenterKey = findEnv.key
            omniCenterSecret = findEnv.secret
            inputEnv.value = findEnv.id
            inputEnv.setAttribute("disabled", "disabled")
            
            if (queryShopId) {
                // Get shop
                await getShops()
                shopId = queryShopId
                inputShop.value = queryShopId
                inputShop.setAttribute("disabled", "disabled")
                productId = queryProductId
                const selectedOption = inputShop.options[inputShop.selectedIndex]
                platformName = selectedOption.getAttribute('data-platform')

                // Category 
                await getCategories()

                // Get product detail
                let getProductDetail = await requestData('get', `/api/v1/products/${queryProductId}`)
                if (getProductDetail.status) {
                    getProductDetail = getProductDetail.data.data
                    inputProductName.value = getProductDetail.name
                    inputProductSku.value = getProductDetail.sku
                    inputDescription.value = getProductDetail.description
                    inputWidth.value = getProductDetail.width
                    inputHeight.value = getProductDetail.height
                    inputWeight.value = getProductDetail.weight
                    inputLength.value = getProductDetail.length
                    inputQuantity.value = getProductDetail.quantity
                    document.querySelector('.preview-img').src = getProductDetail.images[0]
                    if (getProductDetail.type == 'config') {
                        hasChildren.checked = true
                        document.querySelector('#form_skus').classList.remove('d-none')
                        for (const [index, sku] of getProductDetail.items.entries()) {
                            const amountItem = document.querySelectorAll('#form_skus_body .child').length
                            formSkusBody.insertAdjacentHTML('beforeend', templateFormSku(amountItem))
                        }
                    }
                }
            }
        }
    }
})
