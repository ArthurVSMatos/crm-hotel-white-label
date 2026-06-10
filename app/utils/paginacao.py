from sqlalchemy.orm import Query
def paginate(
    query: Query,
    page: int = 1,
    limit: int = 10
):
    offset = (
        page - 1
    ) * limit
    total = query.count()

    data = query.offset(
        offset
    ).limit(
        limit
    ).all()
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "data": data
    }