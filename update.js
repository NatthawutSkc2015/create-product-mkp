// ============= Event : Onload page ====================
document.addEventListener('DOMContentLoaded',async function() {
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

                

                // // Get product detail
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

                    await renderAttributes(categoryId)

                    for (const img of getProductDetail.images) {
                        formDataImage.append('image[]', img)
                        urlsImage.push(img)
                    }
                    
                    renderPreviewImages()
                    
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

                    // Image preview
                    document.querySelectorAll('.box-image .item').forEach((el, i) => {
                        getProductDetail.images.forEach((img, j) => {
                            if (i == j) {
                                el.style.backgroundImage = `url(${img})`
                            }
                        })
                    })

                    // Set skus
                    if (getProductDetail.type == 'config') {
                        hasChildren.checked = true
                        document.querySelector('#form_skus').classList.remove('d-none')
                        formSkusBody.innerHTML = ''
                        for (const [index, sku] of getProductDetail.items.entries()) {
                            const amountItem = document.querySelectorAll('#form_skus_body .child').length
                            formSkusBody.insertAdjacentHTML('beforeend', templateFormSku(amountItem))
                            
                            const childContainer = formSkusBody.querySelector(`.child:nth-child(${index + 1})`)
                            childContainer.querySelector(`.preview-img`).src = sku.images[0]
                            childContainer.querySelector(`[name="skus[${index}][sku]"]`).value = sku.sku
                            childContainer.querySelector(`[name="skus[${index}][quantity]"]`).value = sku.quantity
                            childContainer.querySelector(`[name="skus[${index}][price]"]`).value = sku.price
                            childContainer.querySelector(`[name="skus[${index}][weight]"]`).value = sku.weight || 0
                            // set variant
                            const bodyAttrs = childContainer.querySelector(`.attrs .row`)
                            bodyAttrs.innerHTML = ''
                            for (const [k ,attr] of sku.variation.entries()) {
                                bodyAttrs.insertAdjacentHTML('beforeend', templateFormAttributeSKu(index, k))
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

