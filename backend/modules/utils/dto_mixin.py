from sqlalchemy import inspect as sa_inspect

class DTOMixin:
    @classmethod
    def from_dto(cls, dto):
        relationships = {rel.key: rel.mapper.class_ for rel in sa_inspect(cls).relationships}
        obj = cls(**dto.model_dump(exclude=set(relationships)))
        for name, target_cls in relationships.items():
            value = getattr(dto, name, None)
            if value is None:
                continue
            if isinstance(value, list):
                setattr(obj, name, [target_cls.from_dto(v) for v in value])
            else:
                setattr(obj, name, target_cls.from_dto(value))
        return obj
