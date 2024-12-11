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
const inputStatus = document.querySelector('[name="status"]')
const formCateCascader = document.querySelector('#form_cate_cascader')
const areaProductAttributes = document.querySelector('#area_product_attributes')
const formHeight = document.querySelector('#form_height')
const formLength = document.querySelector('#form_length')
const formWidth = document.querySelector('#form_width')
const formWeight = document.querySelector('#form_weight')
const formPrice = document.querySelector('#form_price')
const formBrand = document.querySelector('#form_brand')
const formStatus = document.querySelector('#form_status')
const formFormOpenCod = document.querySelector('#form_open_cod')

function removeItem(el, action) {
    el.closest('.row').remove()
}
function setValueForm() {
    inputProductName.value = 'Product name ' + shopName
    inputProductSku.value = 'ProductSku'
    inputDescription.value = 'description ' + shopName
    inputWeight.value = Math.floor(Math.random() * 6) + 1
    inputHeight.value = Math.floor(Math.random() * 6) + 1
    inputWidth.value = Math.floor(Math.random() * 6) + 1
    inputLength.value = Math.floor(Math.random() * 6) + 1
}
// function previewImage (el) {
//     const [file] = el.files
//     if (file) {
//         el.closest('div').querySelector('.preview-img').src = URL.createObjectURL(file)
//     }
// }
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
async function renderAttributes(categoryId) {
    // Get Attribute
    let attributesHtml = ''
    let getAttributeByCategory
    let attrs = []
    switch (platformName) {
        case 'Shopee':
            getAttributeByCategory = await requestData('get', '/api/v1/products/attributes', {
                category_id: categoryId
            })
            break
        case 'Lazada': //lazada
            getAttributeByCategory = await requestData('get', '/api/v1/products/attributes', {
                category_id: categoryId
            })
            if (getAttributeByCategory.status == false) {
                return Swal.fire({
                    html: `<div class="text-start"><pre>${JSON.stringify(getAttributeByCategory, null,2)}</pre></div>`,
                    title: 'Error getAttributeByCategory',
                    width: '1000px'
                })
            }
            attrs = getAttributeByCategory.data.data
                .filter(attr => attr.input_type != 'img')
                .filter(attr => attr.is_requried)
            for (const attr of attrs) {
                attributesHtml += `<div class="col-4 mt-1"><label>${attr.label} <span class="text-danger">*required</span></label>`
                switch (attr.input_type) {
                    case 'text':
                    case 'richText':
                        attributesHtml += `<textarea type="text" class="form-control form-control-sm" placeholder="${attr.label}" name="attributes.${attr.name}" rows="3"></textarea>`
                        break
                    case 'numeric':
                        attributesHtml += `<input type="number" class="form-control form-control-sm" placeholder="${attr.label}" name="attributes.${attr.name}" value="30">`
                        break
                    case 'singleSelect':
                        attributesHtml += `<select class="form-control form-control-sm" name="attributes.${attr.name}" placeholder="${attr.label}">`
                        attributesHtml += `<option value=""></option>`
                        if (Array.isArray(attr.options)) {
                            for (const opt of attr.options) {
                                attributesHtml += `<option value="${opt.id}">${opt.name}</option>`
                            }
                        }
                        if (attr.name == 'brand') {
                            for (const opt of dataBrands.data.data) {
                                attributesHtml += `<option value="${opt.id}">${opt.name}</option>`
                            }
                        }
                        attributesHtml += `</select>`
                        break
                    case 'enumInput':
                        attributesHtml += `<div class="row m-0 p-2" style="max-height: 300px; overflow-y: scroll; border: 1px solid #8e8a8a; border-radius: 4px;">`
                        for (const opt of attr.options) {
                            attributesHtml += `<div class="form-check w-50">`
                            attributesHtml += `<input class="form-check-input" type="radio" name="attributes.${attr.name}" id="${opt.id}">`
                            attributesHtml += `<label class="form-check-label" for="">${opt.name}</label>`
                            attributesHtml += `</div>`
                        }
                        attributesHtml += `</div>`
                        break
                    case 'multiEnumInput':
                        attributesHtml += `<div class="row m-0 p-2" style="max-height: 300px; overflow-y: scroll; border: 1px solid #8e8a8a; border-radius: 4px;">`
                        for (const opt of attr.options) {
                            attributesHtml += `<div class="form-check w-50">`
                            attributesHtml += `<input class="form-check-input" type="checkbox" name="attributes.${attr.name}" id="${opt.id}">`
                            attributesHtml += `<label class="form-check-label" for="">${opt.name}</label>`
                            attributesHtml += `</div>`
                        }
                        attributesHtml += `</div>`
                        break
                }
                attributesHtml += '</div>'
            }
            break
        case 'Tiktok Shop': //tiktok
            getAttributeByCategory =await requestData('get', '/api/v1/products/attributes', {
                category_id: categoryId
            })
            if (getAttributeByCategory.status == false) {
                return Swal.fire({
                    html: `<div class="text-start"><pre>${JSON.stringify(getAttributeByCategory, null,2)}</pre></div>`,
                    title: 'Error getAttributeByCategory',
                    width: '1000px'
                })
            }
            attrs = getAttributeByCategory.data.data.filter(attr => attr.attribute_type == 'PRODUCT_PROPERTY')
            for (const attr of attrs) {
                attributesHtml += `<div class="col-4 mt-1"><label>${attr.label} <span class="text-danger">${ attr.is_requried ? '*required' : '' }</span></label>`
                if (Array.isArray(attr.options)) { //select option
                    attributesHtml += `<select class="form-control form-control-sm" ${attr.is_multiple_selection ? `multiple style="height: 300px;"` : ''} name="attributes.${attr.id}" placeholder="${attr.label}" >`
                    attributesHtml += `<option value="">------ None ------</option>`
                    if (Array.isArray(attr.options)) {
                        for (const opt of attr.options) {
                            attributesHtml += `<option value="${opt.id}" data-name="${opt.name}">${opt.name}</option>`
                        }
                    }
                    attributesHtml += `</select>`
                }
                attributesHtml += '</div>'
            }
            break
    }
    areaProductAttributes.innerHTML = attributesHtml
}
function templateFormSku (number) {
    return `
        <div class="row p-3 child" style="margin: calc(-.35 * var(--bs-gutter-x)); margin-top: 8px;">
            <div class="col-2">
                <label for="">Sku</label>
                <input type="text" class="form-control form-control-sm" placeholder="sku" name="skus[${number}][sku]" value="Sku child ${number + 1}" required>
                <input type="hidden" name="skus[${number}][id]">
            </div>
            <div class="col-2">
                <label for="">quantity</label>
                <input type="text" class="form-control form-control-sm" placeholder="qty" name="skus[${number}][quantity]" value="5" required>
            </div>
            <div class="col-2">
                <label for="">Price</label>
                <input type="text" class="form-control form-control-sm" placeholder="price" name="skus[${number}][price]" required value="30">
            </div>
             <div class="col-2">
                <label for="">Weight</label>
                <input type="text" class="form-control form-control-sm" placeholder="weight" name="skus[${number}][weight]" id="" required value="10">
            </div>
            <div class="col-3">
                <label for="">Image</label>
                <input type="file" class="form-control form-control-sm" placeholder="image" name="skus[${number}][image]" id="" onchange="uploadImageChild(this)" accept="image/png, image/jpeg" >
                <img src="" class="preview-img mt-2 w-25">
            </div>
            <div class="col-1 ml-auto text-right">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeItem(this, 'sku')">-</button>
            </div>
            <div class="col-12 attrs mt-2">
                <label for="">
                    Attribues
                    <small class="text-danger">Max 3 variant</small>
                </label>
                <div class="row">
                    <div class="col-6">
                        <input type="text" class="form-control form-control-sm" placeholder="Name" name="skus[${number}][sales_attributes][0][name]" id="" required value="">
                    </div>
                    <div class="col-5">
                        <input type="text" class="form-control form-control-sm" placeholder="Value" name="skus[${number}][sales_attributes][0][value]" id="" required value="">
                    </div>
                    <div class="col-1">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="addAttr(this)">+</button>
                    </div>
                </div>
            </div>
        </div>
    `
}
function templateFormAttributeSKu (number1,number2) {
    return `
        <div class="row mt-2" >
            <div class="col-6">
                <input type="text" class="form-control form-control-sm" placeholder="Name" name="skus[${number1}][sales_attributes][${number2}][name]" value="Size">
            </div>
            <div class="col-5">
                <input type="text" class="form-control form-control-sm" placeholder="Value" name="skus[${number1}][sales_attributes][${number2}][value]" Value="M">
            </div>
            <div class="col-1">
                <button class="btn btn-danger btn-sm" onclick="removeItem(this, 'attr')">-</button>
            </div>
        </div>
    `
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

async function getLogistics() {
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
}

async function getStatus() {
    formStatus.classList.remove('d-none')
    formFormOpenCod.classList.remove('d-none')
    for (const obj of statusesProduct.shopee) {
        const opt = document.createElement('option');
        opt.value = obj.value
        opt.innerHTML = obj.text
        inputStatus.appendChild(opt)
    }
}

function validateForm() {

}
// ============= Event : Select shop ===================
inputShop.addEventListener('change',async (e) => {
    const selectedOption = inputShop.options[inputShop.selectedIndex]
    platformName = selectedOption.getAttribute('data-platform')

    shopId = e.target.value
    shopName = e.target.options[e.target.selectedIndex].text
    openPopup('Loading Category...')
    areaProductAttributes.innerHTML = ''
    
    await renderCategories()
    
    //
    inputStatus.innerHTML = '<option value="">------ None ------</option>'
    formStatus.classList.add('d-none')
    formFormOpenCod.classList.add('d-none')
    formLogistics.classList.add('d-none')

    formHeight.classList.remove('d-none')
    formLength.classList.remove('d-none')
    formWidth.classList.remove('d-none')
    formWeight.classList.remove('d-none')
    formPrice.classList.remove('d-none')
    formBrand.classList.remove('d-none')
    
    switch (platformName) {
        case 'Shopee': //shopee
            await getStatus()
            await getLogistics()
            
            break
        case 'Tiktok Shop': //tiktok
            break
        case 'Line Myshop': //line 
            // for (const obj of statusesProduct.line_myshop) {
            //     const opt = document.createElement('option');
            //     opt.value = obj.value
            //     opt.innerHTML = obj.text
            //     inputStatus.appendChild(opt)
            // }
            break
        case 'Lazada': //lazada
            formHeight.classList.add('d-none')
            formLength.classList.add('d-none')
            formWidth.classList.add('d-none')
            formWeight.classList.add('d-none')
            formPrice.classList.add('d-none')
            formBrand.classList.add('d-none')
            break;
    }
    setValueForm()
})


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

// ============= Event : Onload page ====================
document.addEventListener('DOMContentLoaded',async function() {
    for (const env of envs){
        const opt = document.createElement('option');
        opt.value = env.id
        opt.innerHTML = env.name
        inputEnv.appendChild(opt)
    }
})

// ============= Evnet : click button submit ============
document.querySelector('#submitForm').addEventListener('click', () => {
    formCreate.dispatchEvent(new Event('submit', { cancelable: true }))
})

// ============= Event : Submit form ====================
formCreate.addEventListener('submit', async (el) => {
    // Stop event sent data to server
    el.preventDefault()

    if (envId == '') {
        return openPopup('please select env !', true)
    }

    // Validate before prepare form data
    if (shopId == '') {
        return openPopup('please select shop !', true)
    }


    //  Read file name - value all in form & Prepare data format create product
    const setValue = (obj, path, value) => {
        const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.')
        keys.reduce((o, key, i) => {
            if (i === keys.length - 1) o[key] = value
            else o[key] = o[key] || (isNaN(keys[i + 1]) ? {} : [])
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
        } else if (input.tagName == "SELECT" && key.match(/attributes.*/) && platformName == 'Tiktok Shop') {
            if (input.type == 'select-multiple') {
                selectedOptions = Array.from(input.selectedOptions).map((option) => {
                    return {
                        id: option.value,
                        value: option.innerText
                    }
                })
                setValue(paramsCreate, key, selectedOptions)
            } else {
                const selectedOption = input.options[input.selectedIndex]
                setValue(paramsCreate, key, {
                    id: value,
                    value: selectedOption.getAttribute('data-name')
                })
            }
        } else {
            setValue(paramsCreate, key, value)
        }
    }
    
    // Validat after prepare form data
    if (paramsCreate.category == '') {
        return openPopup('please select category !', true)
    }
    
    const images = []
    const fDataImage = formDataImage.getAll('image[]')
    if (action == 'create') {
        for (const img of fDataImage) {
            images.push(await encodeImageFileAsURL(img))
        }
    } else if (action == 'edit') {
        for (const img of urlsImage) {
            if (!img.match(/blob.*/)) {
                images.push(img)
            }
        }
        for (const img of fDataImage) {
            if (typeof(img) != 'string') {
                images.push(await encodeImageFileAsURL(img))
            }
        }
    }
    if (images.length == 0) {
        return openPopup('please select image !', true)
    }
    paramsCreate.images = images

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
            if (action == 'create') {
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
            }
            break
        case 'Tiktok Shop':
            paramsCreate.attributes = Object.keys(paramsCreate.attributes).map(attr => {
                return {
                    id: attr,
                    value: paramsCreate.attributes[attr] || ''
                }
            })
            paramsCreate.attributes = paramsCreate.attributes.filter(attr => (Array.isArray(attr.value) ? attr.value.length != 0 : attr.value.value != null)).reduce((obj, attr) => {
                obj[attr.id] = attr.value
                return obj
            }, {})
            break
        case 'Lazada':
            paramsCreate.attributes = Object.fromEntries(Object.entries(paramsCreate.attributes).filter(([key, value]) => value !== ""))
            break
        case 'Line MyShop':
            break

    }

    if (debug == 'true') {
        return swal.fire({
            html: `<div class="text-start"><pre>${JSON.stringify(paramsCreate,null,2)}</pre></div>`,
            width: '1000px'
        })
    }

    let methodSent = {}
    if (action == 'create') {
        methodSent.endpoint = '/api/v1/products/create',
        methodSent.method = 'post'
        methodSent.params = {}
        openPopup('Send data to create product...')
    } if (action == 'edit') {
        methodSent.endpoint = `/api/v1/products/${productId}/edit`
        methodSent.method = 'put'
        methodSent.params = {
            // shop_id: shopId
        }
        openPopup('Send data to update product...')
    }

    //debug
    document.querySelector('#bodyCreateProduct').innerHTML = `<pre>${JSON.stringify(paramsCreate, null, 2)}</pre>`

    // return
    //Sent to create/update product
    const responseCreateUpdateProduct = await requestData(methodSent.method, methodSent.endpoint, methodSent.params, paramsCreate)
    await new Promise((res,rej) => { setTimeout(() => { res('ok') }, 1000) })

    if (responseCreateUpdateProduct.status == false || responseCreateUpdateProduct.data.code != 0) {
        return Swal.fire({
            html: `<div class="text-start"><pre>${JSON.stringify(responseCreateUpdateProduct,null,2)}</pre></div>`,
            title: 'Error responseCreateUpdateProduct',
            width: '1000px'
        })
    } else {
        await swal.close()
        openPopup('Success', true)
    }

    // Handle element
    document.querySelector('#respnseCreateProduct').innerHTML = `<pre>${JSON.stringify(responseCreateUpdateProduct, null, 2)}</pre>`
    document.querySelector('#bodyCreateProduct').innerHTML = `<pre>${JSON.stringify(paramsCreate, null, 2)}</pre>`
})