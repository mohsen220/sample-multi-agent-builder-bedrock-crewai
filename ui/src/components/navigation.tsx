// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import PropTypes from 'prop-types';
import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import Box from '@cloudscape-design/components/box';

const navHeader = { text: 'Amazon Bedrock & CrewAI Multi-Agent Builder', href: '/' };
export const navItems: SideNavigationProps['items'] = [
    { type: 'link', text: 'Missions', href: 'missions' },
    { type: 'link', text: 'Agents', href: 'agents' },
    { type: 'link', text: 'Examples', href: 'examples' },
];

export function Navigation({
  header = navHeader,
  items = navItems,
}) {
    const [activeHref, setActiveHref] = React.useState(
        navHeader.href
    );

    console.log(activeHref)

    const onFollowHandler: SideNavigationProps['onFollow'] = event => {
        if (!event.detail.external) {
            event.preventDefault();
            // Validate URL before navigation to prevent open redirect
            try {
                // Get the href from the event
                const href = event.detail.href;
                
                // Handle relative URLs properly
                if (href.startsWith('/') || !href.includes('://')) {
                    // For relative URLs, just navigate to them
                    const baseUrl = window.location.origin;
                    const fullUrl = href.startsWith('/') ? `${baseUrl}${href}` : `${baseUrl}/${href}`;
                    window.location.href = fullUrl;
                    setActiveHref(href);
                    return;
                } else {
                    // For absolute URLs, validate them
                    const url = new URL(href);
                    const allowedOrigins = [window.location.origin];
                    if (allowedOrigins.includes(url.origin)) {
                        // Sanitize the URL path to prevent XSS
                        const sanitizedPath = url.pathname.replace(/[<>'"]/g, '');
                        url.pathname = sanitizedPath;
                        
                        // Prevent javascript: protocol
                        if (!url.protocol.startsWith('javascript:')) {
                            window.location.href = url.href;
                            setActiveHref(url.href);
                            return;
                        }
                    }
                }
                console.error("Navigation to external URL blocked");
            } catch (error) {
                console.error("Invalid URL in navigation", error);
            }
        }
    };

    return (
        <>
            <SideNavigation 
                items={items} 
                header={header} 
                activeHref={window.location.href.substring(window.location.href.lastIndexOf('/') + 1)} 
                onFollow={onFollowHandler} 
            />
        </>
    );
}

Navigation.propTypes = {
  header: PropTypes.object,
  items: PropTypes.array
};
