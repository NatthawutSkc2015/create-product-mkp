// ============= Event : Onload page ====================
document.addEventListener('DOMContentLoaded',async function() {
    // User by page edit product
    const urlParams = new URLSearchParams(window.location.search)
    const queryEnvId = urlParams.get('env')
    const queryShopId = urlParams.get('shop')
    const queryProductId = urlParams.get('id')
    const queryAction = urlParams.get('action')
    const queryDebug = urlParams.get('debug')
    debug = queryDebug
    
    if (queryAction == 'edit') {
        action = 'edit'
        if (queryEnvId) {
            const findEnv = envs.find(env => env.id == queryEnvId)
            envId = findEnv.id
            omniCenterUrl = findEnv.url
            omniCenterKey = findEnv.key
            omniCenterSecret = findEnv.secret
            authJwt = findEnv.auth_jwt
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

                

                // Get product detail
                let getProductDetail = await requestData('get', `/api/v1/products/${queryProductId}`)
                if (getProductDetail.status) {
                    getProductDetail = getProductDetail.data.data
                    dataProduct = getProductDetail
                    document.querySelector('#title_page').textContent = `Update product ${ getProductDetail.name }`
                    const categoryId = getProductDetail.category

                    

                    // Brand 
                    await getBrands(categoryId)

                    //Category 
                    await renderCategories()

                    //Attribtes
                    await renderAttributes(categoryId)

                    //Images
                    for (const img of getProductDetail.images) {
                        formDataImage.append('image[]', img)
                        urlsImage.push(img)
                    }
                    renderPreviewImages()

                    const trProductID  = document.querySelector('#product_id')
                    trProductID.classList.remove('d-none')
                    
                    
                    // Split data to platform
                    switch (platformName) {
                        case 'Tiktok Shop':
                            trProductID.querySelector('tr td:nth-child(2)').textContent = getProductDetail.info.product_id
                            if (getProductDetail.info.skus.length == 1) {
                                const findProduct = getProductDetail.info.skus.find((sku, index) => index == 0)
                                if (findProduct.sales_attributes.length) {
                                    getProductDetail.type = 'config'
                                    getProductDetail.items = getProductDetail.info.skus.map((sku, index) => {
                                        const variation = []
                                        let imageUrls = []
                                        let attributeQuantity = 0
                                        sku.sales_attributes.forEach((attribute) => {
                                            if (Array.isArray(attribute?.sku_img?.url_list)) {
                                                imageUrls.push(...attribute.sku_img.url_list.splice(0,1))
                                            }
                                            variation.push({
                                            name: attribute.name,
                                            value_name: attribute.value_name,
                                            })
                                        })
                                        sku.stock_infos.forEach((stock) => {
                                            attributeQuantity += stock.available_stock
                                        })
                                        return {
                                            model_id: sku.id,
                                            images: [],
                                            sku: variation.map(v => v.value_name).join(' '),
                                            quantity: attributeQuantity,
                                            price: sku.price.original_price,
                                            weight: 0,
                                            variation: variation
                                        }
                                    })
                                }
                            }
                            break
                        case 'Shopee':
                            trProductID.querySelector('tr td:nth-child(2)').textContent = getProductDetail.info.item_id
                            await getStatus()
                            await getLogistics()

                            $("#logistics").val(getProductDetail.logistics.map(l => String(l.logistic_id)))
                            productSizeByCarier(inputLogistic)
                            for (const logistic of getProductDetail.logistics) {
                                document.querySelector(`[data-carier-id="${logistic.logistic_id}"]`).value = logistic.size_id
                            }
                            formFormOpenCod.querySelector('[name="is_cod"]').checked = getProductDetail.is_cod_open
                            break
                        case 'Lazada':
                            trProductID.querySelector('tr td:nth-child(2)').textContent = getProductDetail.info.item_id
                            break
                        case 'Line Myshop':
                            trProductID.querySelector('tr td:nth-child(2)').textContent = getProductDetail.info.id
                            break
                    }
                    // Set form
                    categoryInput.value = categoryId
                    instanceCategoryCascaderMenu.val(pathCategoryCascader(categoryId))
                    inputProductName.value = getProductDetail.name
                    inputProductSku.value = getProductDetail.sku
                    inputDescription.value = getProductDetail.description
                    inputWidth.value = getProductDetail.width
                    inputHeight.value = getProductDetail.height
                    inputWeight.value = getProductDetail.weight
                    inputLength.value = getProductDetail.length
                    inputQuantity.value = getProductDetail.quantity
                    inputStatus.value = getProductDetail.status
                    

                    // Image preview
                    document.querySelectorAll('.box-image .item').forEach((el, i) => {
                        getProductDetail.images.forEach((img, j) => {
                            if (i == j) {
                                el.style.backgroundImage = `url(${img})`
                            }
                        })
                    })

                    switch (platformName) {
                        case 'Line Myshop':
                            break
                    }

                    // Set skus
                    if (getProductDetail.type == 'config') {
                        hasChildren.checked = true
                        document.querySelector('#form_skus').classList.remove('d-none')
                        formSkusBody.innerHTML = ''
                        for (const [index, sku] of getProductDetail.items.entries()) {
                            const amountItem = document.querySelectorAll('#form_skus_body .child').length
                            formSkusBody.insertAdjacentHTML('beforeend', templateFormSku(amountItem))
                            

                            
                            const childContainer = formSkusBody.querySelector(`.child:nth-child(${index + 1})`)
                            childContainer.querySelector(`.preview-img`).src = sku.images[0] || noImage
                            childContainer.querySelector(`[name="skus[${index}][id]"]`).value = sku.model_id
                            childContainer.querySelector(`[name="skus[${index}][sku]"]`).value = sku.sku
                            childContainer.querySelector(`[name="skus[${index}][quantity]"]`).value = sku.quantity
                            childContainer.querySelector(`[name="skus[${index}][price]"]`).value = sku.price
                            childContainer.querySelector(`[name="skus[${index}][weight]"]`).value = sku.weight || 0
                            
                            // set variant
                            const bodyAttrs = childContainer.querySelector(`.attrs`)
                            if (sku.variation.length > 1) {
                                for (let i = 0; i < sku.variation.length - 1; i++) {
                                    bodyAttrs.insertAdjacentHTML('beforeend', templateFormAttributeSKu(index, i + 1))
                                }
                            }
                            for (const [k ,attr] of sku.variation.entries()) {
                                childContainer.querySelector(`[name="skus[${index}][sales_attributes][${k}][name]"]`).value = attr.name
                                childContainer.querySelector(`[name="skus[${index}][sales_attributes][${k}][value]"]`).value = attr.value_name
                            }
                        }
                    }
                }
            }
        }
    }
})

