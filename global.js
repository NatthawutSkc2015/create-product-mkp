// ============== Global Variable ==================
let action = 'create'
let productId = ''
let envId = ''
let shopId = ''
let shopName = ''
let platformId = ''
let platformName = ''
let omniCenterUrl = ''
let omniCenterKey = ''
let omniCenterSecret = ''
let authJwt = ''
const inputEnv = document.querySelector('[id="env"]')
const inputShop = document.querySelector('[id="shop"]')

let inputProductName = document.querySelector('[name="product_name"]')
let inputProductSku = document.querySelector('[name="product_sku"]')
let inputDescription = document.querySelector('[name="description"]')
let inputWidth = document.querySelector('[name="width"]')
let inputHeight = document.querySelector('[name="height"]')
let inputWeight = document.querySelector('[name="weight"]')
let inputLength = document.querySelector('[name="length"]')
let inputQuantity = document.querySelector('[name="quantity"]')
let inputSelectImage = document.querySelectorAll('.select-image')
const envs = [
    {
        id: 'LOCAL',
        name: 'Localhost',
        url: 'http://127.0.0.1:4000',
        key: 'ab1049847e957ba4',
        secret: '986ecb64e253c685dde76b90e0f52ea2b4bcb6700f5436483a31ecff48d0c62d',
        auth_jwt: ''
    },
    {
        id: 'DEV',
        name: 'Dev',
        url: 'https://dev-api.syncorder.co',
        key: '8619ebad17c092a4',
        secret: '8aa025e228952d353302a025f5f8935458d65ac3b293c384b4b4d1c89011bdde',
        auth_jwt: ''
    },
    {
        id: 'UAT',
        name: 'Uat',
        url: 'https://uat-api.syncorder.co',
        key: '9ec1548eca4140b6',
        secret: '8489277fa5ae21de7fcb3928c6203e4ec031b25f6be6b58de108615f8d113c70',
        auth_jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjNhYmU3NzYzNDg4OWFlNzA0M2JmYWQxIiwiaWF0IjoxNzMxMzc0Nzk1LCJleHAiOjE3NjI5MTA3OTV9.bI8DiFvHyfc6qljKg8TPXtfI_zgZMd982MUu7jIVgsc'
    },
    {
        id: 'PROD',
        name: 'Prod',
        url: 'https://api.syncorder.co',
        key: '4801f05834822df6',
        secret: '658e549c25aad9bc2da9001d5dcfd2de3d055f0a9f2b98e7cbb9bf8220d6ab96',
        auth_jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjNhZDAzYjQ1MjQ3MGY0NTI5N2I0ODJhIiwiaWF0IjoxNzE1OTM1NTY0LCJleHAiOjE3NDc0NzE1NjR9.SqIczjdoUSmr1ofti7A-IGyp7VoSauYrbnGN3GtdBQg'
    }
]

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
async function axiosRequest(method, url, data, config = {}) {
    switch (method) {
        case 'get':
            request = axios.get(url, config)
            break
        case 'post':
            request = axios.post(url, data, config)
            break
        case 'patch':
            request = axios.patch(url, data, config)
            break
    }
    return request.then(res => {
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
async function requestData(method, endpoint, params = {}, data) {
    params.shop_id = shopId
    const auth = await authenticated(params)
    return axiosRequest(method, omniCenterUrl + endpoint + auth.queryString , data)
}
async function requestData2(method, endpoint, params = {}, data) {
    const uRLSearchParams = new URLSearchParams(params)
    return axiosRequest(method, omniCenterUrl + endpoint + `?${uRLSearchParams}`, data, {
        headers: {
            Authorization: 'Bearer ' + authJwt
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
async function getShops() {
    const getShopAll = await requestData2('get', '/shops', {
        per_page: 100
    })
    if (getShopAll.status) {
        swal.close()
        inputShop.innerHTML = '<option>------ None ------</option>'
        const shops = getShopAll.data.data.filter(shop => shop.status)
        for (const shop of shops) {
            let shopName = ''
            let platform = ''
            if (shop.hasOwnProperty('tiktok_shop')) {
                shopName = `${shop.tiktok_shop.shop.shop_name}`
                platform = `Tiktok Shop`
            } else if (shop.hasOwnProperty('shopee')) {
                shopName = `${shop.shopee.info.shop_name}`
                platform = `Shopee`
            } else if (shop.hasOwnProperty('lazada')) {
                shopName = `${shop.lazada.info.shop_name}`
                platform = `Lazada`
            } else if (shop.hasOwnProperty('line_myshop')) {
                shopName = `${shop.line_myshop.shop_name}`
                platform = `Line Myshop`
            } else if (shop.hasOwnProperty('woo_commerce')) {
                shopName = `${shop.woo_commerce.shop_name}`
                platform = `Woo Commrece`
            } else if (shop.hasOwnProperty('magento2')) {
                shopName = `${shop.magento2.shop_name}`
                platform = `Magento`
            }
            const opt = document.createElement('option');
            opt.value = shop.id
            opt.setAttribute('data-platform', platform)
            opt.setAttribute('data-platform-id', shop.platform._id)
            opt.innerHTML = `${platform} - ${shopName}`
            inputShop.appendChild(opt)
        }
    }
}
async function getCategories() {
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
            brand.innerHTML = '<option value="">------ None ------</option>'
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
}
async function renderAttributes(categoryId, getBrands) {
    // Get Attribute
    let attributesHtml = ''
    let getAttributeByCategory
    let attrs = []
    switch (platformName) {
        case 'Lazada': //lazada
            getAttributeByCategory = await requestData('get', '/api/v1/products/attributes', {
                category_id: categoryId
            })
            if (getAttributeByCategory.status == false) {
                return openPopup(JSON.signature(getAttributeByCategory.data, true))
            }
            attrs = getAttributeByCategory.data.data.filter(attr => attr.is_requried)
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
                        attributesHtml += `<select class="form-control form-control-sm" name="attributes.${attr.name}" placeholder="${attr.label}">`
                        attributesHtml += `<option value=""></option>`
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
            break
        case 'Tiktok Shop': //tiktok
            getAttributeByCategory =await requestData('get', '/api/v1/products/attributes', {
                category_id: categoryId
            })
            if (getAttributeByCategory.status == false) {
                return openPopup(JSON.signature(getAttributeByCategory.data, true))
            }
            attrs = getAttributeByCategory.data.data
            for (const attr of attrs) {
                attributesHtml += `<div class="col-4 mt-1"><label>${attr.label} <span class="text-danger">${ attr.is_requried ? '*required' : '' }</span></label>`
                if (Array.isArray(attr.options)) { //select option
                    attributesHtml += `<select class="form-control form-control-sm" name="attributes.${attr.id}" placeholder="${attr.label}" >`
                    attributesHtml += `<option value="">------ None ------</option>`
                    if (Array.isArray(attr.options)) {
                        for (const opt of attr.options) {
                            attributesHtml += `<option value="${opt.id}">${opt.name}</option>`
                        }
                    }
                    attributesHtml += `</select>`
                } else { //text
                    attributesHtml += `<input type="text" class="form-control form-control-sm" placeholder="${attr.label}" name="attributes.${attr.id}">`
                }
                attributesHtml += '</div>'
            }
            break
    }
    areaProductAttributes.innerHTML = attributesHtml
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
            <div class="col-1 ml-auto text-right"><button type="button" class="btn btn-danger btn-sm" onclick="removeItem(this, 'sku')">-</button></div>
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

function selectImage(el) {
    const inputId = el.getAttribute('data-image')
    document.querySelector(`#${inputId}`).click()
}

function formatDate(time) {
    return moment(time).format('DD/MM/YYYY HH:mm:ss')
}

inputSelectImage.forEach(el => {
    el.addEventListener('change', () => {
        if (el?.files[0] == undefined) {
            return false
        }
        const imageUrl = URL.createObjectURL(el.files[0])
        const dataImageId = el.getAttribute('id')
        const outputPreview = document.querySelector(`[data-image="${dataImageId}"]`)
        outputPreview.style.backgroundImage = `url('${imageUrl}')`
    })
})

// ============= Event : Select Env ===================
inputEnv.addEventListener('change',async (e) => {
    const findEnv = envs.find(env => env.id == e.target.value)
    omniCenterUrl = findEnv.url
    omniCenterKey = findEnv.key
    omniCenterSecret = findEnv.secret
    authJwt = findEnv.auth_jwt
    openPopup(`Loadding shop of env ${findEnv.name}`)
    await getShops()
})