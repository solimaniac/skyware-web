import { HighlightKind, HighlightText } from "@/util/highlight.tsx";
import { resolveReflectionUrl } from "@/util/resolveUrl.ts";
import { Fragment, type ReactNode } from "react";
import {
	ArrayType,
	ConditionalType,
	type DeclarationReflection,
	IndexedAccessType,
	InferredType,
	IntersectionType,
	IntrinsicType,
	LiteralType,
	MappedType,
	NamedTupleMember,
	OptionalType,
	PredicateType,
	QueryType,
	ReferenceType,
	type Reflection,
	ReflectionKind,
	ReflectionType,
	RestType,
	type SomeType,
	TemplateLiteralType,
	TupleType,
	TypeOperatorType,
	UnionType,
} from "typedoc";

export function LinkIfPossible(
	{ type, reflection, children }: { type: SomeType; reflection?: never; children?: ReactNode } | {
		type?: never;
		reflection: Reflection;
		children?: ReactNode;
	},
) {
	const text = type ? type.stringify("none") : reflection.name;
	const span = <HighlightText kind={HighlightKind.SomeExport}>{children || text}</HighlightText>;
	if (type && (!(type instanceof ReferenceType) || !type.package?.startsWith("@skyware/"))) {
		return span;
	} else {
		const url = resolveReflectionUrl(reflection || type.reflection as DeclarationReflection);
		if (!url) return span;
		return (
			<HighlightText
				kind={reflection?.kindOf(ReflectionKind.SomeExport)
					? HighlightKind.SkywareDeclaration
					: (reflection?.kind || HighlightKind.SkywareDeclaration)}
				as="a"
				href={url}
				className={"font-mono"}
			>
				{children || text}
			</HighlightText>
		);
	}
}

export function renderType(type?: SomeType | undefined): ReactNode {
	if (!type) return null;
	if (type instanceof ArrayType) {
		return (
			<>
				{renderType(type.elementType)}
				<HighlightText kind={HighlightKind.Punctuation}>{"[]"}</HighlightText>
			</>
		);
	}
	if (type instanceof ConditionalType) {
		return (
			<>
				{renderType(type.checkType)}
				<HighlightText kind={HighlightKind.Punctuation}>{" extends "}</HighlightText>
				{renderType(type.extendsType)}
				<HighlightText kind={HighlightKind.Punctuation}>{" ? "}</HighlightText>
				{renderType(type.trueType)}
				<HighlightText kind={HighlightKind.Punctuation}>{" : "}</HighlightText>
				{renderType(type.falseType)}
			</>
		);
	}
	if (type instanceof IndexedAccessType) {
		return (
			<>
				{renderType(type.objectType)}
				<HighlightText kind={HighlightKind.Punctuation}>{"["}</HighlightText>
				{renderType(type.indexType)}
				<HighlightText kind={HighlightKind.Punctuation}>{"]"}</HighlightText>
			</>
		);
	}
	if (type instanceof InferredType) {
		return (
			<>
				<HighlightText kind={HighlightKind.Text}>{"infer "}</HighlightText>
				<HighlightText kind={HighlightKind.TypeParameter}>{type.name}</HighlightText>
				{type.constraint
					? (
						<>
							<HighlightText kind={HighlightKind.Punctuation}>
								{" extends "}
							</HighlightText>
							{renderType(type.constraint)}
						</>
					)
					: null}
			</>
		);
	}
	if (type instanceof IntersectionType) {
		return type.types.map((t, i) => (
			<Fragment key={i}>
				{renderType(t)}
				{i < type.types.length - 1 && (
					<HighlightText kind={HighlightKind.Punctuation}>{" & "}</HighlightText>
				)}
			</Fragment>
		));
	}
	if (type instanceof IntrinsicType) {
		return <HighlightText kind={HighlightKind.Intrinsic}>{type.name}</HighlightText>;
	}
	if (type instanceof LiteralType) {
		return (
			<HighlightText kind={HighlightKind.String}>
				{typeof type.value === "bigint"
					? type.value.toString()
					: JSON.stringify(type.value)}
			</HighlightText>
		);
	}
	if (type instanceof MappedType) {
		return (
			<>
				<HighlightText kind={HighlightKind.Punctuation}>{"{["}</HighlightText>
				<HighlightText kind={HighlightKind.Text}>{type.parameter}</HighlightText>
				<HighlightText kind={HighlightKind.Punctuation}>{" in "}</HighlightText>
				{renderType(type.parameterType)}
				{type.nameType
					? (
						<>
							<HighlightText kind={HighlightKind.Punctuation}>{" as "}</HighlightText>
							{renderType(type.nameType)}
						</>
					)
					: null}
				<HighlightText kind={HighlightKind.Punctuation}>{"]: "}</HighlightText>
				{renderType(type.templateType)}
			</>
		);
	}
	if (type instanceof OptionalType) {
		return (
			<>
				{renderType(type.elementType)}
				<HighlightText kind={HighlightKind.Punctuation}>?</HighlightText>
			</>
		);
	}
	if (type instanceof PredicateType) {
		return (
			<>
				{type.asserts
					? <HighlightText kind={HighlightKind.Text}>{"asserts "}</HighlightText>
					: null}
				<HighlightText kind={HighlightKind.SomeValue}>{type.name}</HighlightText>
				<HighlightText kind={HighlightKind.Text}>{" is "}</HighlightText>
				{renderType(type.targetType)}
			</>
		);
	}
	if (type instanceof QueryType) {
		return (
			<>
				<HighlightText kind={HighlightKind.Keyword}>{"typeof "}</HighlightText>
				{renderType(type.queryType)}
			</>
		);
	}
	if (type instanceof ReferenceType) {
		if (type.package === "typescript") {
			return (
				<>
					<HighlightText kind={HighlightKind.Intrinsic}>{type.name}</HighlightText>
					{type.typeArguments && type.typeArguments.length > 0
						? (
							<>
								<HighlightText kind={HighlightKind.Punctuation}>
									{"<"}
								</HighlightText>
								{type.typeArguments.map((arg, i) => (
									<Fragment key={i}>
										{renderType(arg)}
										{i < type.typeArguments!.length - 1 && (
											<HighlightText kind={HighlightKind.Punctuation}>
												{", "}
											</HighlightText>
										)}
									</Fragment>
								))}
								<HighlightText kind={HighlightKind.Punctuation}>
									{">"}
								</HighlightText>
							</>
						)
						: null}
				</>
			);
		}
		return <LinkIfPossible type={type} />;
	}
	if (type instanceof ReflectionType) {
		return (!type.declaration.children && type.declaration.signatures?.length)
			? (
				<>
					<HighlightText kind={HighlightKind.Punctuation}>{"("}</HighlightText>
					{type.declaration.signatures[0].parameters?.map((param, i) => (
						<Fragment key={i}>
							{param.name === "__namedParameters" ? null : (
								<>
									<HighlightText kind={HighlightKind.Parameter}>
										{param.name}
									</HighlightText>
									{param.flags.isOptional
										? (
											<HighlightText kind={HighlightKind.Punctuation}>
												?
											</HighlightText>
										)
										: null}
									<HighlightText kind={HighlightKind.Punctuation}>
										{": "}
									</HighlightText>
								</>
							)}
							{renderType(param.type)}
							{i < type.declaration.signatures![0].parameters!.length - 1 && (
								<HighlightText kind={HighlightKind.Punctuation}>
									{" "}
								</HighlightText>
							)}
						</Fragment>
					))}
					<HighlightText kind={HighlightKind.Punctuation}>{") => "}</HighlightText>
					{renderType(type.declaration.signatures[0].type)}
				</>
			)
			: (
				<HighlightText kind={HighlightKind.Punctuation}>
					{"{ "}
					{type.declaration.children?.slice(0, 3).map((property, i) => (
						<>
							<HighlightText kind={HighlightKind.Parameter}>
								{property.name}
							</HighlightText>
							{property.flags.isOptional
								? <HighlightText kind={HighlightKind.Punctuation}>?</HighlightText>
								: null}
							<HighlightText kind={HighlightKind.Punctuation}>{": "}</HighlightText>
							{renderType(property.type)}
							<HighlightText kind={HighlightKind.Punctuation}>;</HighlightText>
							{i < type.declaration.children!.length - 1 && (
								<HighlightText kind={HighlightKind.Text}>{" "}</HighlightText>
							)}
						</>
					)) || null}
					{(type.declaration.children?.length || 0) > 3
						? <HighlightText kind={HighlightKind.Text}>{" ..."}</HighlightText>
						: null}
					{" }"}
				</HighlightText>
			);
	}
	if (type instanceof RestType) {
		return (
			<>
				<HighlightText kind={HighlightKind.Punctuation}>{"..."}</HighlightText>
				{renderType(type.elementType)}
			</>
		);
	}
	if (type instanceof TemplateLiteralType) {
		return (
			<>
				<HighlightText kind={HighlightKind.Punctuation}>`</HighlightText>
				<HighlightText kind={HighlightKind.String}>{type.head}</HighlightText>
				{type.tail.map(([type, text], i) => (
					<Fragment key={i}>
						<HighlightText kind={HighlightKind.Punctuation}>{"${"}</HighlightText>
						{renderType(type)}
						<HighlightText kind={HighlightKind.Punctuation}>{"}"}</HighlightText>
						<HighlightText kind={HighlightKind.String}>{text}</HighlightText>
					</Fragment>
				))}
				<HighlightText kind={HighlightKind.Punctuation}>`</HighlightText>
			</>
		);
	}
	if (type instanceof TupleType) {
		return (
			<>
				<HighlightText kind={HighlightKind.Punctuation}>{"["}</HighlightText>
				{type.elements.map((t, i) => (
					<Fragment key={i}>
						{renderType(t)}
						{i < type.elements.length - 1 && (
							<HighlightText kind={HighlightKind.Punctuation}>{", "}</HighlightText>
						)}
					</Fragment>
				))}
				<HighlightText kind={HighlightKind.Punctuation}>{"]"}</HighlightText>
			</>
		);
	}
	if (type instanceof NamedTupleMember) {
		return (
			<>
				<HighlightText kind={HighlightKind.Text}>{type.name}</HighlightText>
				{type.isOptional
					? <HighlightText kind={HighlightKind.Punctuation}>?</HighlightText>
					: null}
				<HighlightText kind={HighlightKind.Punctuation}>:</HighlightText>
				{renderType(type.element)}
			</>
		);
	}
	if (type instanceof TypeOperatorType) {
		return (
			<>
				<HighlightText kind={HighlightKind.Keyword}>{type.operator}</HighlightText>
				{renderType(type.target)}
			</>
		);
	}
	if (type instanceof UnionType) {
		return type.types.map((t, i) => (
			<Fragment key={i}>
				{renderType(t)}
				{i < type.types.length - 1 && (
					<HighlightText kind={HighlightKind.Punctuation}>{" | "}</HighlightText>
				)}
			</Fragment>
		));
	}
	console.warn(`Unknown type: ${type.name}`);
	return <HighlightText kind={HighlightKind.Text}>{type.name}</HighlightText>;
}