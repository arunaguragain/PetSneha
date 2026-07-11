jest.mock('../src/repositories/admin.repository', () => ({
  getPlatformStats: jest.fn(),
  getPendingVets: jest.fn(),
  getPendingArticles: jest.fn(),
  getReportedPosts: jest.fn(),
  getPendingProducts: jest.fn(),
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  setUserActiveStatus: jest.fn(),
  getAllPets: jest.fn(),
  getAllVets: jest.fn(),
  getAllArticles: jest.fn(),
  getAllProducts: jest.fn(),
  getAllForumPosts: jest.fn(),
  setVetVerifiedStatus: jest.fn(),
  setArticlePublishedStatus: jest.fn(),
  deleteForumPost: jest.fn(),
  dismissForumPostReport: jest.fn(),
  setPinnedStatus: jest.fn(),
  setProductVerifiedStatus: jest.fn(),
  getAllOrders: jest.fn(),
}));

jest.mock('../src/models/forumPost.model', () => ({
  findById: jest.fn(),
}));

const adminRepository = require('../src/repositories/admin.repository');
const ForumPost = require('../src/models/forumPost.model');
const adminService = require('../src/services/admin.service');

describe('admin service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('builds admin dashboard counts from repository results', async () => {
    adminRepository.getPlatformStats.mockResolvedValue({ users: 1 });
    adminRepository.getPendingVets.mockResolvedValue([{ id: 'v1' }]);
    adminRepository.getPendingArticles.mockResolvedValue([{ id: 'a1' }]);
    adminRepository.getReportedPosts.mockResolvedValue([{ id: 'p1' }]);
    adminRepository.getPendingProducts.mockResolvedValue([{ id: 'pr1' }]);

    const result = await adminService.getAdminDashboard();

    expect(result.pendingVetCount).toBe(1);
    expect(result.pendingArticleCount).toBe(1);
    expect(result.reportedPostCount).toBe(1);
    expect(result.pendingProductCount).toBe(1);
  });

  it('prevents an admin from deactivating their own account', async () => {
    await expect(adminService.deactivateUser('admin-1', 'admin-1')).rejects.toMatchObject({
      statusCode: 400,
      message: 'You cannot deactivate your own account.',
    });
  });

  it('returns a not found error when the requested user does not exist', async () => {
    adminRepository.getUserById.mockResolvedValue(null);

    await expect(adminService.getUserById('missing')).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found.',
    });
  });

  it('rejects an already verified vet', async () => {
    adminRepository.getAllVets.mockResolvedValue({ items: [{ _id: 'vet-1', isVerified: true }] });

    await expect(adminService.approveVet('vet-1')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Vet is already verified.',
    });
  });

  it('publishes an article when it exists and is not already published', async () => {
    adminRepository.getPendingArticles.mockResolvedValue([{ _id: 'a1', isPublished: false }]);
    adminRepository.setArticlePublishedStatus.mockResolvedValue({ _id: 'a1' });

    const result = await adminService.publishArticle('a1');

    expect(adminRepository.setArticlePublishedStatus).toHaveBeenCalledWith('a1', true);
    expect(result).toEqual({ _id: 'a1' });
  });

  it('pins a post when the forum post exists', async () => {
    ForumPost.findById.mockResolvedValue({ _id: 'p1', isPinned: false });
    adminRepository.setPinnedStatus.mockResolvedValue({ _id: 'p1', isPinned: true });

    const result = await adminService.pinPost('p1');

    expect(adminRepository.setPinnedStatus).toHaveBeenCalledWith('p1', true);
    expect(result.isPinned).toBe(true);
  });
});
