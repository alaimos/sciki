<?php


namespace App\Modules\Abstract;


use App\Modules\Abstract\Services\AccessControlService;
use JetBrains\PhpStorm\Pure;

abstract class ModuleProvider
{

    private string $modulePath;

    public function __construct()
    {
        $reflection = new \ReflectionClass(static::class);
        $definitionPath = $reflection->getFileName();
        $this->modulePath = realpath(dirname($definitionPath));
    }

    /**
     * Returns the path of the current module
     *
     * @return string
     */
    public function modulePath(): string
    {
        return $this->modulePath;
    }

    /**
     * Returns an array of Model=>PolicyClass that
     * will be merged with the policy array of the AuthServiceProvider
     *
     * @return array
     */
    public function policies(): array
    {
        return [];
    }

    /**
     * Returns a list of paths were database migrations can be found
     *
     * @return string[]|null
     */
    #[Pure] public function migrationsPath(): ?array
    {
        $migrationsPath = $this->modulePath . '/migrations';
        if (!file_exists($migrationsPath)) {
            return null;
        }

        return [$migrationsPath];
    }

    /**
     * Add routes to the laravel RouteServiceProvider.
     * These routes will be PUBLIC.
     * This function is called within the routes/web.php
     * therefore the same syntax can be used to provide new routes.
     */
    public function publicRoutes(): void
    {
    }

    /**
     * Add routes to the laravel RouteServiceProvider.
     * These routes will be visible only to AUTHENTICATED users.
     * This function is called within the routes/web.php
     * therefore the same syntax can be used to provide new routes.
     */
    public function userRoutes(): void
    {
    }

    /**
     * Add routes to the laravel RouteServiceProvider.
     * These routes will be visible only to EDITORS.
     * This function is called within the routes/web.php
     * therefore the same syntax can be used to provide new routes.
     */
    public function editorRoutes(): void
    {
    }

    /**
     * Add routes to the laravel RouteServiceProvider.
     * These routes will be visible only to ADMINS.
     * This function is called within the routes/web.php
     * therefore the same syntax can be used to provide new routes.
     */
    public function adminRoutes(): void
    {
    }

    /**
     * Seeds the database for this Module.
     */
    public function seeder(): void
    {
    }

    /**
     * Returns an optional array of variables that will be shared
     * with the inertia page
     *
     * @return array|null
     */
    public function inertiaShare(): ?array
    {
        return null;
    }

    /**
     * Returns an optional AccessControlService used to deliver
     * access control data to the Inertia-powered GUI
     *
     * @return \App\Modules\Abstract\Services\AccessControlService|null
     */
    public function accessControlService(): ?AccessControlService
    {
        return null;
    }

    /**
     * Returns an array of ScikiSidebarLink that will be added to the sidebar in the "Resources" section
     *
     * @return \App\Modules\Abstract\ScikiSidebarLink[]
     */
    public function exposesGuiResources(): array
    {
        return [];
    }

    /**
     * Returns an array of ScikiSidebarLink that will be added to the sidebar in the "Tools" section
     *
     * @return \App\Modules\Abstract\ScikiSidebarLink[]
     */
    public function exposesGuiTools(): array
    {
        return [];
    }

}
