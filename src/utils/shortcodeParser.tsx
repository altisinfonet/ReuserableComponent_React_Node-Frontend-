import React, { ReactElement, ReactNode } from 'react';

// -------------------- Types --------------------

type ShortcodeComponent = React.ComponentType<any>;

interface ShortcodeMap {
    [key: string]: ShortcodeComponent;
}

interface ExtraProps {
    formData?: Record<string, any>;
    onClick?: (formData?: Record<string, any>) => void;
    onChange?: (e: React.ChangeEvent<any>) => void;
    [key: string]: any;
}

// -------------------- Main Parser --------------------

export function parseShortcodes(
    content: ReactNode,
    shortcodes: ShortcodeMap,
    extraProps: ExtraProps = {}
): ReactNode {
    const { formData, onClick, ...restProps } = extraProps;

    const shortcodeRegex = /\[(\w+)([^\]]*)\](?:([^[]*?)\[\/\1\])?/gs;

    if (!content) return null;

    // --------------------------------------------------
    // Handle Array Content (multiple nodes)
    // --------------------------------------------------
    if (Array.isArray(content)) {
        return content.flatMap((item, index) => {
            if (typeof item === 'string') {
                return parseShortcodes(item, shortcodes, extraProps);
            }

            if (React.isValidElement<{ children?: ReactNode }>(item)) {
                const children = item.props?.children;
                return React.cloneElement(
                    item,
                    { key: index },
                    children
                        ? parseShortcodes(children, shortcodes, extraProps)
                        : children
                );
            }

            return item ?? null;
        });
    }

    // --------------------------------------------------
    // Handle React Element
    // --------------------------------------------------
    if (React.isValidElement<{ children?: ReactNode }>(content)) {
        const children = content.props?.children;
        return React.cloneElement(
            content,
            {},
            children ? parseShortcodes(children, shortcodes, extraProps) : children
        );
    }

    // --------------------------------------------------
    // Only process strings for shortcodes
    // --------------------------------------------------
    if (typeof content !== 'string') return content;

    const textContent = content;
    const elements: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // --------------------------------------------------
    // Parse Shortcodes
    // --------------------------------------------------
    while ((match = shortcodeRegex.exec(textContent)) !== null) {
        const [fullMatch, name, attrs, innerContent] = match;
        const Component = shortcodes[name.toLowerCase()];

        if (!Component) continue;

        // Text before shortcode
        if (match.index > lastIndex) {
            const textBefore = textContent.slice(lastIndex, match.index);
            if (textBefore.trim()) {
                elements.push(textBefore);
            }
        }

        const props = parseAttributes(attrs);

        // Controlled inputs
        if (formData && props.name) {
            props.value = formData[props.name] ?? '';
            props.onChange = extraProps.onChange;
        }

        // Button click handling
        if (name.toLowerCase().includes('button')) {
            props.onClick = () => onClick?.(formData);
        }

        elements.push(
            <Component key={elements.length} {...props} {...restProps}>
                {innerContent
                    ? parseShortcodes(innerContent, shortcodes, extraProps)
                    : null}
            </Component>
        );

        lastIndex = shortcodeRegex.lastIndex;
    }

    // Remaining text
    if (lastIndex < textContent.length) {
        const remainingText = textContent.slice(lastIndex);
        if (remainingText.trim()) {
            elements.push(remainingText);
        }
    }

    return elements.length > 0 ? elements : textContent;
}

// -------------------- Attribute Parser --------------------

function parseAttributes(attrs: string): Record<string, any> {
    const attrRegex = /(\w+)(?:="([^"]*)")?/g;
    const props: Record<string, any> = {};
    let match: RegExpExecArray | null;

    while ((match = attrRegex.exec(attrs)) !== null) {
        const [, key, value] = match;
        props[key] = value !== undefined ? value : true;
    }

    return props;
}
