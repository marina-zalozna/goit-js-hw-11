import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createMarkup, resetGallery } from './js/markUp';
import ImageFetchApi from './js/fetch';
// import OnlyScroll from 'only-scrollbar';

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

const form = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('#load-more');

form.addEventListener('submit', onSubmitForm);
loadMoreBtn.addEventListener('click', onLoadMore);

const imageFetchApi = new ImageFetchApi();
let data = 0;

async function onSubmitForm(e) {
  e.preventDefault();

  imageFetchApi.query = e.target.elements.searchQuery.value;
  resetGallery();

  imageFetchApi.resetPage();
  loadMoreBtn.classList.remove('is-hidden');

  if (imageFetchApi.query === '') {
    resetGallery();
    loadMoreBtn.classList.remove('is-hidden');
    imageFetchApi.resetPage();
    return;
  }
  if (loadMoreBtn.classList.contains('is-hidden')) {
    loadMoreBtn.classList.toggle('is-hidden');
  }

  try {
    const { totalHits, hits } = await imageFetchApi.getImage();

    if (hits.length !== 0) {
      createMarkup(hits);
      loadMoreBtn.classList.add('is-hidden');
      data += hits.length;
      Notify.success(`Hooray! We found ${totalHits} images.`);
      lightbox.refresh();
    } else {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    if (totalHits < 40) {
      loadMoreBtn.classList.remove('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore() {
  imageFetchApi.incrementPage();

  try {
    const { totalHits, hits } = await imageFetchApi.getImage();
    createMarkup(hits);
    scrollSmoothly();
    lightbox.refresh();

    data += hits.length;

    if (data >= totalHits) {
      loadMoreBtn.classList.remove('is-hidden');
      Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    console.log(error);
  }
}

function scrollSmoothly() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 4,
    behavior: 'smooth',
  });
}