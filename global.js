// ============== Global Variable ==================
const noImage = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'
let debug = ''
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
let instanceCategoryCascaderMenu
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
let dataProduct
let dataBrands = []
let dataCategories = []
let formDataImage = new FormData()
const urlsImage = []
const envs = [
    {
        id: 'LOCAL',
        name: 'Localhost',
        url: 'http://192.168.1.56:4000',
        key: 'ab1049847e957ba4',
        secret: '986ecb64e253c685dde76b90e0f52ea2b4bcb6700f5436483a31ecff48d0c62d',
        auth_jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjUzMWVjM2IxYTcwODA5ZmU1YmVkZmMzIiwiaWF0IjoxNzMyNTAxMjY0LCJleHAiOjE3NjQwMzcyNjR9.iVAGiRfEOBKJUNszFMN0g9KHjz5wmgNF8Pgoju2O_aE'
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
        case 'put':
            request = axios.put(url, data, config)
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
    return Swal.fire({
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


async function renderCategories() {
    dataCategories = await requestData('get', '/api/v1/products/catgories')
    if (dataCategories.status == false || dataCategories.data.code != 0) {
        return Swal.fire({
            html: `<div class="text-start"><pre>${JSON.stringify(dataCategories, null,2)}</pre></div>`,
            title: 'Error renderCategories',
            width: '1000px'
        })
    }
    
    dataCategories = dataCategories.data.data
    swal.close()
    categoryInput.value = ''
    function transformData(data) {
        const idMap = {}, result = [];
        data.forEach(item => {
            const node = { indexCode: item.id, name: item.name, s: [] };
            idMap[item.id] = node;
            if (item.parent_id === "0") result.push(node);
            else idMap[item.parent_id]?.s.push(node);
        })
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
    let dataCates = transformData(dataCategories)
    dataCates.forEach(function(item) {
        item.label = item.name;
        item.value = item.indexcode;
        if (item.s && item.s.length) {
            item.children = item.s
            processItems(item.s)
        }
    })

    brand.closest('tr').classList.remove('d-none')

    // ============= Event : Select Category ===================
    instanceCategoryCascaderMenu = categoryCascaderMenu.zdCascader({
        data: [],
        container: '#category-cascader-menu',
        // search: true,
        onChange: async function(value, label, datas){
            const categoryId = label.indexCode
            categoryInput.value = categoryId
            openPopup('Loading Brands...')
            
            await getBrands(categoryId)
            await renderAttributes(categoryId)
        }
    })
    instanceCategoryCascaderMenu.data().zdCascader.reload(dataCates)
}
async function getBrands (categoryId) {
    dataBrands = await requestData('get', '/api/v1/products/brands', {
        category_id: categoryId
    })

    // Get Brand
    brand.innerHTML = '<option value="">------ None ------</option>'
    await new Promise((res,rej) => { setTimeout(() => { res('ok') }, 1000) })
    if (dataBrands.status == true) {
        swal.close()
        for (const cate of dataBrands.data.data){
            const opt = document.createElement('option');
            opt.value = cate.id
            opt.innerHTML = cate.name
            brand.appendChild(opt)
        }
    }
}

function selectImage(el) {
    const [file] = el.files
    if (file) {
        el.closest('div').querySelector('.preview-img').src = URL.createObjectURL(file)
    }
}

function formatDate(time) {
    return moment(time).format('DD/MM/YYYY HH:mm:ss')
}
function getCategoryPath(categoryId, categories, path = []) {
    const category = categories.find(cate => cate.id === categoryId);
    if (category) {
        path.unshift(category.name)
        if (category.parent_id) {
            return getCategoryPath(category.parent_id, categories, path)
        }
    }
    return path
}
function pathCategoryCascader(categoryId) {
    const path = getCategoryPath(categoryId, dataCategories)
    return path.join(" / ")
}

function renderPreviewImages () {
    let html = ''
    for (const [i, url] of urlsImage.entries()) {
        html += `
            <div class="inner item" in blobs">
                <img src="${url}">
                <button type="button" onclick="deletePreview(${i})"><span></span></button>
            </div>
        `
    }
    const boxPreviewImage = document.querySelector('.box-preview-image')
    boxPreviewImage.querySelectorAll('.inner.item').forEach(e => e.remove())
    boxPreviewImage.insertAdjacentHTML('afterbegin', html)
}
function previewImage(el) {
    const files = el.target.files
    let n = 0
    for (const f of files) {
        urlsImage.push(URL.createObjectURL(f))
        formDataImage.append('image[]', files[n])
        n++
    }
    el.target.value = ''
    renderPreviewImages()
}
function deletePreview(i) {
    const images = formDataImage.getAll('image[]')
    formDataImage.delete('image[]')
    images
        .filter((image, j) => j !== i)
        .forEach(image => formDataImage.append('image[]', image))
    urlsImage.splice(i, 1)
    renderPreviewImages()
}

function uploadImageChild (el) {
    const [file] = el.files
    if (file) {
        el.closest('div').querySelector('.preview-img').src = URL.createObjectURL(file)
    }
}
// ============= Event : Select Env ===================
inputEnv.addEventListener('change',async (e) => {
    const findEnv = envs.find(env => env.id == e.target.value)
    envId = findEnv.id
    omniCenterUrl = findEnv.url
    omniCenterKey = findEnv.key
    omniCenterSecret = findEnv.secret
    authJwt = findEnv.auth_jwt
    openPopup(`Loadding shop of env ${findEnv.name}`)
    await getShops()
})