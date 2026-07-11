jest.mock('../src/repositories/article.repository', () => ({
  findAllPublished: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  create: jest.fn(),
  deleteById: jest.fn(),
}));

jest.mock('../src/repositories/vet.repository', () => ({
  findByUserId: jest.fn(),
}));

const articleRepository = require('../src/repositories/article.repository');
const vetRepository = require('../src/repositories/vet.repository');
const articleService = require('../src/services/article.service');

describe('article service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('builds a filter for pet type, season, and tags', async () => {
    articleRepository.findAllPublished.mockResolvedValue([]);

    await articleService.listArticles({ petType: 'dog', season: 'winter', tags: 'vaccination, nutrition' });

    expect(articleRepository.findAllPublished).toHaveBeenCalledWith({
      petType: 'dog',
      season: 'winter',
      tags: { $in: ['vaccination', 'nutrition'] },
    });
  });

  it('increments views for a published article', async () => {
    articleRepository.findById.mockResolvedValue({ _id: 'art-1', isPublished: true, views: 4 });
    articleRepository.updateById.mockResolvedValue({});

    const result = await articleService.getArticle('art-1');

    expect(articleRepository.updateById).toHaveBeenCalledWith('art-1', { views: 5 });
    expect(result).toEqual({ _id: 'art-1', isPublished: true, views: 4 });
  });

  it('allows admins to publish an article', async () => {
    articleRepository.findById.mockResolvedValue({ _id: 'art-1' });
    articleRepository.updateById.mockResolvedValue({});

    await articleService.publishArticle({ role: 'admin' }, 'art-1');

    expect(articleRepository.updateById).toHaveBeenCalledWith('art-1', { isPublished: true, isVerified: true });
  });

  it('blocks a vet from deleting another vet article', async () => {
    articleRepository.findById.mockResolvedValue({ authorId: { toString: () => 'vet-2' } });
    vetRepository.findByUserId.mockResolvedValue({ _id: 'vet-1' });

    await expect(articleService.deleteArticle({ role: 'vet', id: 'user-1' }, 'art-1')).rejects.toMatchObject({
      statusCode: 403,
      message: 'You can only delete your own article.',
    });
  });
});
