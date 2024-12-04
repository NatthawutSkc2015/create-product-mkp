
// ============== Global Variable ==================
let shopId = ''
let shopName = ''
let omniCenterUrl = 'http://localhost:4000'
let omniCenterKey = 'ab1049847e957ba4'
let omniCenterSecret = '986ecb64e253c685dde76b90e0f52ea2b4bcb6700f5436483a31ecff48d0c62d'
const envs = [
    {
        id: 'LOCAL',
        name: 'Locale',
        url: 'http://localhost:4000',
        key: 'ab1049847e957ba4',
        secret: '986ecb64e253c685dde76b90e0f52ea2b4bcb6700f5436483a31ecff48d0c62d',
    },
    {
        id: 'DEV',
        name: 'Dev',
        url: 'https://dev-api.syncorder.co',
        key: '8619ebad17c092a4',
        secret: '8aa025e228952d353302a025f5f8935458d65ac3b293c384b4b4d1c89011bdde',
    },
    {
        id: 'UAT',
        name: 'Uat',
        url: 'https://uat-api.syncorder.co',
        key: '9ec1548eca4140b6',
        secret: '8489277fa5ae21de7fcb3928c6203e4ec031b25f6be6b58de108615f8d113c70',
    }
]
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
const inputEnv = document.querySelector('[id="env"]')
const inputShop = document.querySelector('[id="shop"]')
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


// ============= Share =============================
async function authenticated(object) {
    const timestamp = Math.floor(Date.now() / 1000)
    const query = {
        ...object,
        key: omniCenterKey,
        timestamp: timestamp
    }
    let baseString = `secret=${omniCenterSecret}`
    for(const key of Object.keys(query).sort()) {
        baseString += `${key}=${query[key]}`
    }
    const signature = CryptoJS.HmacSHA256(baseString, omniCenterSecret).toString(CryptoJS.enc.Hex)
    Object.assign(query, {signature: signature})
    return {
        queryString: `?${new URLSearchParams(query)}`,
        signature: signature
    }
}
async function requestData(method, endpoint, params = {}, data) {
    let request
    params.shop_id = shopId
    const auth = await authenticated(params)
    switch (method) {
        case 'get':
            request = axios.get(omniCenterUrl + endpoint + auth.queryString)
            break
        case 'post':
            request = axios.post(omniCenterUrl + endpoint + auth.queryString, data)
            break
    }
    return await request.then(res => {
        return {
            status: true,
            data: res.data
        }
    }).catch(err => {
        return {
            status: false,
            error: err?.message,
            response: err?.response?.data
        }
    })
}
function openPopup(msg, showConfirmButton = false, allowOutsideClick = false) {
    Swal.fire({
        title: 'Info',
        text: msg,
        icon: 'warning',
        showConfirmButton: showConfirmButton,
        allowOutsideClick: allowOutsideClick,
        allowEscapeKey: false
    })
}

const templateFormSku = (number) => {
    return `
        <div class="row p-3 child" style="margin: calc(-.35 * var(--bs-gutter-x)); margin-top: 8px;">
            <!--div class="col-3">
                <label for="">name</label>
                <input type="text" class="form-control form-control-sm" placeholder="name" name="skus[${number}][name]" required value="Product child ${number + 1}">
            </div -->
            <div class="col-2">
                <label for="">Sku</label>
                <input type="text" class="form-control form-control-sm" placeholder="sku" name="skus[${number}][sku]" value="Sku child ${number + 1}" required>
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
                <input type="file" class="form-control form-control-sm" placeholder="image" name="skus[${number}][image]" id="" onchange="uploadPicture(this)">
                <img src="" class="preview-img mt-2 w-100">
            </div>
            <div class="col-1 ml-auto text-right"><button type="button" class="btn btn-danger btn-sm" onclick="removeItem(this, 'sku')">- sku</button></div>
            <div class="col-12 attrs mt-2">
                <label for="">
                    Attribues
                    <small class="text-danger">Max 3 variant</small>
                </label>
                <div class="row">
                    <div class="col-6">
                        <input type="text" class="form-control form-control-sm" placeholder="Name" name="skus[${number}][sales_attributes][0][name]" id="" required value="Color">
                    </div>
                    <div class="col-5">
                        <input type="text" class="form-control form-control-sm" placeholder="Value" name="skus[${number}][sales_attributes][0][value]" id="" required value="Black">
                    </div>
                    <div class="col-1">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="addAttr(this)">+</button>
                    </div>
                </div>
            </div>
        </div>
    `
}
const templateFormAttributeSKu = (number1,number2) => {
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
function encodeImageFileAsURL(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            resolve(reader.result)
        }
        reader.onerror = (error) => {
            reject(error);
        }
        reader.readAsDataURL(imageFile);
    })
}
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
    document.querySelector('[name="product_name"]').value = 'Product name ' + shopName
    document.querySelector('[name="product_sku"]').value = 'ProductSku'
    document.querySelector('[name="description"]').value = 'description ' + shopName
    document.querySelector('[name="width"]').value = Math.floor(Math.random() * 6) + 1
    document.querySelector('[name="height"]').value = Math.floor(Math.random() * 6) + 1
    document.querySelector('[name="weight"]').value = Math.floor(Math.random() * 6) + 1
    document.querySelector('[name="length"]').value = Math.floor(Math.random() * 6) + 1
    
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
async function renderAttributes(categoryId, getBrands) {
    // Get Attribute
    switch (shopId) {
        case '65092e88a68fc8e47dbd3e18': //lazada
            const getAttributeByCategory = await requestData('get', '/api/v1/products/attributes', {
                category_id: categoryId
            })
            if (getAttributeByCategory.status == false) {
                return openPopup(JSON.signature(getAttributeByCategory.data, true))
            }
            let attributesHtml = ''
            let attrs = getAttributeByCategory.data.data.filter(attr => attr.is_requried)
            for (const attr of attrs) {
                attributesHtml += `<div class="col-4 mt-1"><label>${attr.label} <span class="text-danger">*required</span></label>`
                switch (attr.input_type) {
                    case 'text':
                        attributesHtml += `<input type="text" class="form-control form-control-sm" placeholder="${attr.label}" name="attributes.${attr.name}">`
                        break
                    case 'numeric':
                        attributesHtml += `<input type="number" class="form-control form-control-sm" placeholder="${attr.label}" name="attributes.${attr.name}" value="30">`
                        break
                    case 'singleSelect':
                        attributesHtml += `<select class="form-control form-control-sm" name="attributes.${attr.name}" placeholder="${attr.label}" name="attributes.${attr.name}">`
                        if (Array.isArray(attr.options)) {
                            for (const opt of attr.options) {
                                attributesHtml += `<option value="${opt.id}">${opt.name}</option>`
                            }
                        }
                        if (attr.name == 'brand') {
                            for (const opt of getBrands.data.data) {
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
            areaProductAttributes.innerHTML = attributesHtml
            break
        case '66cd6d284fcb64a00fe50b3c': //tiktok
            break
    }
}


// ============= Event : Select Platform ===================
inputEnv.addEventListener('change',async (e) => {
    const findEnv = envs.find(env => env.id == e.target.value)
    omniCenterUrl = findEnv.url
    omniCenterKey = findEnv.key
    omniCenterSecret = findEnv.secret
    openPopup(`Loadding shop of env ${findEnv.name}`)
    const getShopAll = await requestData('get', '/api/v1/shop')
    if (getShopAll.status) {
        swal.close()
        inputShop.innerHTML = '<option>------ None ------</option>'
        for (const shop of getShopAll.data.data) {
            let shopName = ''
            if (shop.hasOwnProperty('tiktok_shop')) {
                shopName = `[Tiktok] - ${shop.tiktok_shop.shop.shop_name}`
            } else if (shop.hasOwnProperty('shopee')) {
                shopName = `[Shopee] - ${shop.shopee.info.shop_name}`
            } else if (shop.hasOwnProperty('lazada')) {
                shopName = `[Lazada] - ${shop.lazada.info.shop_name}`
            } else if (shop.hasOwnProperty('line_myshop')) {
                shopName = `[Line Myshop] - ${shop.line_myshop.shop_name}`
            } else if (shop.hasOwnProperty('woo_commerce')) {
                shopName = `[Woo Commerce] - ${shop.woo_commerce.shop_name}`
            } else if (shop.hasOwnProperty('magento2')) {
                shopName = `[Magento] - ${shop.magento2.shop_name}`
            }
            const opt = document.createElement('option');
            opt.value = shop.id
            opt.innerHTML = shopName
            inputShop.appendChild(opt)
        }
    }
})


// ============= Event : Select Platform ===================
inputShop.addEventListener('change',async (e) => {
    shopId = e.target.value
    shopName = e.target.options[e.target.selectedIndex].text
    openPopup('Loading Category...')
    areaProductAttributes.innerHTML = ''
    const getCategories = await requestData('get', '/api/v1/products/catgories')
    if (getCategories.status == false || getCategories.data.code != 0) {
        openPopup(JSON.stringify(getCategories,null,2), true)
        return
    }
    let dataCates = getCategories.data.data
    swal.close()
    categoryCascaderMenu.val('Select category')
    categoryInput.value = ''
    function transformData(data) {
        const idMap = {}, result = [];
        data.forEach(item => {
            const node = { indexCode: item.id, name: item.name, s: [] };
            idMap[item.id] = node;
            if (item.parent_id === "0") result.push(node);
            else idMap[item.parent_id]?.s.push(node);
        });
        return result;
    }

    // parse the data
    function processItems(items) {
        items.forEach(function(item) {
            item.label = item.name;
            item.value = item.indexcode;
            if (item.s && item.s.length) {
                item.children = item.s
                processItems(item.s)
            }
        })
    }
    dataCates = transformData(dataCates)
    dataCates.forEach(function(item) {
        item.label = item.name;
        item.value = item.indexcode;
        if (item.s && item.s.length) {
            item.children = item.s
            processItems(item.s)
        }
    });

    brand.closest('tr').classList.remove('d-none')

    // ============= Event : Select Category ===================
    const instanceCategoryCascaderMenu = categoryCascaderMenu.zdCascader({
        data: [],
        container: '#category-cascader-menu',
        // search: true,
        onChange: async function(value, label, datas){
            const categoryId = label.indexCode
            categoryInput.value = categoryId
            openPopup('Loading Brands...')
            const getBrands = await requestData('get', '/api/v1/products/brands', {
                category_id: categoryId
            })

            // Get Brand
            brand.innerHTML = ''
            await new Promise((res,rej) => { setTimeout(() => { res('ok') }, 1000) })
            if (getBrands.status == true) {
                swal.close()
                for (const cate of getBrands.data.data){
                    const opt = document.createElement('option');
                    opt.value = cate.id
                    opt.innerHTML = cate.name
                    brand.appendChild(opt)
                }
            }

            await renderAttributes(categoryId, getBrands)
        }
    })
    instanceCategoryCascaderMenu.data().zdCascader.reload(dataCates)
    
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
    
    switch (shopId) {
        case '65092d6e4873f03c5a5aba12': //shopee
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
        case '66cd6d284fcb64a00fe50b3c': //tiktok
            break
        case '65092da54873f03c5a5aba26': //line 
            formStatus.classList.remove('d-none')
            for (const obj of statusesProduct.line_myshop) {
                const opt = document.createElement('option');
                opt.value = obj.value
                opt.innerHTML = obj.text
                inputStatus.appendChild(opt)
            }
            break
        case '65092e88a68fc8e47dbd3e18': //lazada
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
    document.querySelector('#form_skus_body').insertAdjacentHTML('beforeend', templateFormSku(amountItem))
})

// ============= Event : Submit form ====================
formCreate.addEventListener('submit', async (el) => {
    // Stop event sent data to server
    el.preventDefault()

    // Reset dat
    logisticsSelect = []

    //  Read file name - value all in form & Prepare data format create product
    const setValue = (obj, path, value) => {
        const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.')
        keys.reduce((o, key, i) => {
            if (i === keys.length - 1) o[key] = value
            else o[key] = o[key] || (isNaN(keys[i + 1]) ? {} : []);
            return o[key];
        }, obj)
    }
    const paramsCreate = {}
    const formData = new FormData(formCreate)
    for (const [key, value] of formData.entries()) {
        const input = formCreate.querySelector(`[name="${key}"]`)
        if (input && input.type === "checkbox") {
            const checkedCheckboxes = Array.from(formCreate.querySelectorAll(`[name="${key}"]:checked`)).map(checkbox => checkbox.id);
            setValue(paramsCreate, key, checkedCheckboxes);
        } else if (input && input.type === "radio") {
            const checkedRadio = formCreate.querySelector(`[name="${key}"]:checked`);
            setValue(paramsCreate, key, checkedRadio ? checkedRadio.id : null)
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


    switch (shopId) {
        case '65092d6e4873f03c5a5aba12': //shopee
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
    }
    

    //Sent to create product
    openPopup('Send data to create product...')
    const responseCreateProduct = await requestData('post', '/api/v1/products/create', {}, paramsCreate)
    await new Promise((res,rej) => { setTimeout(() => { res('ok') }, 1000) })
    await swal.close()

    // Handle element
    document.querySelector('#respnseCreateProduct').innerHTML = `<pre>${JSON.stringify(responseCreateProduct, null, 2)}</pre>`
    document.querySelector('#bodyCreateProduct').innerHTML = `<pre>${JSON.stringify(paramsCreate, null, 2)}</pre>`
})

// ============= Event : Onload page ====================
document.addEventListener('DOMContentLoaded', function() {
    setValueForm()

    for (const env of envs){
        const opt = document.createElement('option');
        opt.value = env.id
        opt.innerHTML = env.name
        inputEnv.appendChild(opt)
    }
})
