<?php
/** @noinspection NonSecureUniqidUsageInspection */

namespace App\Modules\Abstract;

use JetBrains\PhpStorm\ArrayShape;

class ScikiSidebarLink
{
    private string $linkTitle;
    private string $linkRoute;
    private ?string $linkIcon;
    private ?string $resourceName;
    private ?string $resourcePermission;

    /**
     * GuiResource constructor.
     *
     * @param  string  $linkTitle
     * @param  string  $linkRoute
     * @param  string|null  $linkIcon
     * @param  string|null  $resourceName
     * @param  string|null  $resourcePermission
     */
    public function __construct(string $linkTitle, string $linkRoute, ?string $linkIcon, ?string $resourceName, ?string $resourcePermission)
    {
        $this->linkTitle = $linkTitle;
        $this->linkRoute = $linkRoute;
        $this->linkIcon = $linkIcon;
        $this->resourceName = $resourceName;
        $this->resourcePermission = $resourcePermission;
    }

    /**
     * Get the title that will be displayed to the user in the sidebar
     *
     * @return string
     */
    public function getLinkTitle(): string
    {
        return $this->linkTitle;
    }

    /**
     * Set the title that will be displayed to the user in the sidebar
     *
     * @param  string  $linkTitle
     *
     * @return $this
     */
    public function setLinkTitle(string $linkTitle): self
    {
        $this->linkTitle = $linkTitle;

        return $this;
    }

    /**
     * Get the route that will be used to build the link displayed to the user in the sidebar
     *
     * @return string
     */
    public function getLinkRoute(): string
    {
        return $this->linkRoute;
    }

    /**
     * Set the route that will be used to build the link displayed to the user in the sidebar
     *
     * @param  string  $linkRoute
     *
     * @return $this
     */
    public function setLinkRoute(string $linkRoute): self
    {
        $this->linkRoute = $linkRoute;

        return $this;
    }

    /**
     * Get the class name of the icon that will be used to build the link displayed to the user in the sidebar
     * (use icons in the fontawesome solid namespace).
     *
     * @return string|null
     */
    public function getLinkIcon(): ?string
    {
        return $this->linkIcon;
    }

    /**
     * Set the class name of the icon that will be used to build the link displayed to the user in the sidebar
     * (use icons in the fontawesome solid namespace).
     *
     * @param  string|null  $linkIcon
     *
     * @return $this
     */
    public function setLinkIcon(?string $linkIcon): self
    {
        $this->linkIcon = $linkIcon;

        return $this;
    }

    /**
     * Get the name of the resource used to check for permissions.
     *
     * @return string|null
     */
    public function getResourceName(): ?string
    {
        return $this->resourceName;
    }

    /**
     * Set the name of the resource used to check for permissions. It is a key of the
     * first level of the capabilities array.
     *
     * @param  string|null  $resourceName
     *
     * @return $this
     */
    public function setResourceName(?string $resourceName): self
    {
        $this->resourceName = $resourceName;

        return $this;
    }

    /**
     * Get the name of the permission used to check whether to display the link.
     *
     * @return string|null
     */
    public function getResourcePermission(): ?string
    {
        return $this->resourcePermission;
    }

    /**
     * Set the name of the permission used to check whether to display the link. It is a key of the
     * second level of the capabilities array (capabilities.[resourceName].[resourcePermission]).
     *
     * @param  string|null  $resourcePermission
     *
     * @return $this
     */
    public function setResourcePermission(?string $resourcePermission): self
    {
        $this->resourcePermission = $resourcePermission;

        return $this;
    }


    /**
     * Transforms this object in an array
     *
     * @return array
     */
    #[ArrayShape([
        'key'                => "string",
        'title'              => "string",
        'route'              => "string",
        'icon'               => "null|string",
        'resourceName'       => "null|string",
        'resourcePermission' => "null|string",
    ])] public function toArray(): array
    {
        return [
            'key'                => uniqid(),
            'title'              => $this->linkTitle,
            'route'              => $this->linkRoute,
            'icon'               => $this->linkIcon,
            'resourceName'       => $this->resourceName,
            'resourcePermission' => $this->resourcePermission,
        ];
    }

}
