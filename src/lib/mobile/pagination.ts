export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1)
  const requestedLimit = parseInt(searchParams.get('limit') || '20', 10) || 20
  const limit = Math.min(Math.max(requestedLimit, 1), 100)
  const skip = (page - 1) * limit

  return {
    page,
    limit,
    skip
  }
}

export function buildPagination(params: {
  page: number
  limit: number
  total: number
}) {
  return {
    page: params.page,
    limit: params.limit,
    total: params.total,
    totalPages: Math.ceil(params.total / params.limit)
  }
}
