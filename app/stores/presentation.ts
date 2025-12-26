import type { Presentation, PresentationDoc, PresentationSlide } from '~/types/presentation'

import { editPresentation } from '~/services/presentation'

export const usePresentationStore = defineStore('presentation', () => {
  const presentation = ref<Presentation>()

  const presentationDoc = ref<PresentationDoc>({
    id         : '',
    title      : '',
    description: '',
    slides     : [],
    createdAt  : 0,
    updatedAt  : 0,
  })

  const setPresentation = (pre: Presentation) => {
    // TODO: 默认值需要优化
    pre.tone = pre.tone || 'professional'
    presentation.value = pre
    if (pre.doc) {
      presentationDoc.value = JSON.parse(pre.doc)
    }
    else {
      presentationDoc.value = {
        id         : pre.id,
        title      : pre.base.title,
        description: '',
        slides     : [],
        createdAt  : Date.now(),
        updatedAt  : Date.now(),
      }
    }
  }

  const slides = computed(() => presentationDoc.value.slides)

  const setPresentationDoc = (doc: PresentationDoc) => {
    presentationDoc.value = doc
  }

  const setSlide = (index: number, slide: PresentationSlide) => {
    presentationDoc.value.slides[index] = slide
  }

  const setSlides = (slides: Array<PresentationSlide>) => {
    presentationDoc.value.slides = slides
  }

  const addSlide = (slide: PresentationSlide, index?: number) => {
    if (index !== undefined) {
      presentationDoc.value.slides.splice(index, 0, slide)
    }
    else {
      presentationDoc.value.slides.push(slide)
    }
  }

  const saveDoc = async () => {
    if (!presentation.value)
      throw new Error('No presentation to save.')

    const doc = JSON.stringify(presentationDoc.value)
    return editPresentation(presentation.value.id, { doc })
  }

  const autoSaveDoc = () => {
    // 自动保存，定时器，每三秒保存一次
    setInterval(() => {
      saveDoc()
    }, 30000)
  }

  return {
    presentation,
    presentationDoc,
    setPresentation,
    slides,
    setPresentationDoc,
    saveDoc,
    setSlide,
    setSlides,
    addSlide,
    autoSaveDoc,
  }
})
